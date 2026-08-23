import { IBillRepository } from '../ports/IBillRepository';
import { IBillPaymentRepository } from '../ports/IBillPaymentRepository';
import { IBillTransactionPort } from '../ports/IBillTransactionPort';
import { MarkBillPaidCommand } from '../dto/MarkBillPaidCommand';
import { MarkBillPaidResultDTO } from '../dto/MarkBillPaidResultDTO';
import {
  BillId,
  BillPayment,
  BillPaymentId,
  BillAmount,
  CurrencyCode,
  BillSchedulingService,
} from '../../domain';
import { BillApplicationError } from '../errors/BillApplicationError';
import { generateUUID } from '../../../../core/utils/uuid';

export class MarkBillPaidUseCase {
  constructor(
    private readonly billRepository: IBillRepository,
    private readonly billPaymentRepository: IBillPaymentRepository,
    private readonly billTransactionPort: IBillTransactionPort
  ) {
    Object.freeze(this);
  }

  public async execute(command: MarkBillPaidCommand): Promise<MarkBillPaidResultDTO> {
    const billId = new BillId(command.billId);

    // Step 1 — Load Bill
    const billResult = await this.billRepository.findById(billId);
    if (!billResult.success) {
      throw new BillApplicationError(
        'REPOSITORY_ERROR',
        `Failed to fetch bill: ${billResult.error.message}`
      );
    }

    const bill = billResult.data;
    if (!bill) {
      throw new BillApplicationError('BILL_NOT_FOUND', `Bill "${command.billId}" not found.`);
    }

    if (bill.isArchived) {
      throw new BillApplicationError(
        'BILL_ALREADY_ARCHIVED',
        `Cannot record payment against archived bill "${bill.name.value}".`
      );
    }

    // Step 2 — Determine Occurrence Key
    const occurrenceKey = bill.nextDueDate.toOccurrenceKey();

    // Step 3 — Idempotency Pre-check
    const paymentCheckResult = await this.billPaymentRepository.findPaymentByOccurrence(billId, occurrenceKey);
    if (!paymentCheckResult.success) {
      throw new BillApplicationError(
        'REPOSITORY_ERROR',
        `Failed to verify payment occurrence: ${paymentCheckResult.error.message}`
      );
    }

    if (paymentCheckResult.data) {
      throw new BillApplicationError(
        'ALREADY_PAID_FOR_PERIOD',
        `Bill "${bill.name.value}" has already been paid for occurrence ${occurrenceKey}.`
      );
    }

    // Step 4 — Validate Amount Match
    const commandAmount = new BillAmount(command.amount, new CurrencyCode(command.currencyCode));
    if (!commandAmount.equals(bill.amount)) {
      throw new BillApplicationError(
        'PAYMENT_AMOUNT_MISMATCH',
        `Requested payment amount (${command.amount} ${command.currencyCode}) does not match bill amount (${bill.amount.amount} ${bill.amount.currencyCode.value}).`
      );
    }

    // Step 5 — Transaction Integration Mode
    const paidAt = command.paidAt ?? new Date();
    let linkedTransactionId: string | null = null;

    if (command.executionMode === 'AUTO_CREATE') {
      if (!command.accountId || command.accountId.trim().length === 0) {
        throw new BillApplicationError(
          'INVALID_EXECUTION_MODE',
          'Account ID is required for AUTO_CREATE mode.'
        );
      }

      const txResult = await this.billTransactionPort.createExpenseTransaction({
        userId: bill.userId,
        accountId: command.accountId,
        amount: command.amount,
        currencyCode: command.currencyCode,
        description: bill.name.value,
        categoryId: bill.categoryId,
        transactionDate: paidAt,
      });

      if (!txResult.success) {
        throw new BillApplicationError(
          'TRANSACTION_INTEGRATION_FAILED',
          `Transaction auto-creation failed: ${txResult.error.message}`
        );
      }

      linkedTransactionId = txResult.data;
    } else if (command.executionMode === 'LINK_EXISTING') {
      if (!command.transactionId || command.transactionId.trim().length === 0) {
        throw new BillApplicationError(
          'INVALID_EXECUTION_MODE',
          'Transaction ID is required for LINK_EXISTING mode.'
        );
      }

      const verifyResult = await this.billTransactionPort.verifyTransactionExists(command.transactionId);
      if (!verifyResult.success) {
        throw new BillApplicationError(
          'TRANSACTION_INTEGRATION_FAILED',
          `Transaction verification failed: ${verifyResult.error.message}`
        );
      }

      if (!verifyResult.data) {
        throw new BillApplicationError(
          'TRANSACTION_NOT_FOUND',
          `Target transaction "${command.transactionId}" not found.`
        );
      }

      linkedTransactionId = command.transactionId.trim();
    } else if (command.executionMode === 'UNLINKED') {
      linkedTransactionId = null;
    } else {
      throw new BillApplicationError(
        'INVALID_EXECUTION_MODE',
        `Unsupported execution mode: "${command.executionMode}".`
      );
    }

    // Step 6 — Construct BillPayment Entity
    const paymentId = new BillPaymentId(generateUUID());
    const payment = new BillPayment({
      id: paymentId,
      billId: bill.id,
      occurrenceKey,
      userId: bill.userId,
      paidAt,
      amount: bill.amount,
      linkedTransactionId,
    });

    // Step 7 — Advance Bill Schedule / Archive
    const updatedBill = BillSchedulingService.advanceBill(bill, paidAt);

    // Step 8 — Atomic Persistence Transaction
    const saveResult = await this.billRepository.savePaymentAndBill(payment, updatedBill);
    if (!saveResult.success) {
      // Compensation (ADR-022 § 19): if bill-payment persistence fails after an AUTO_CREATE
      // transaction was written, void the orphan transaction so the ledger stays consistent.
      // LINK_EXISTING and UNLINKED modes must NOT trigger rollback — those transactions are
      // either owned by the user independently or do not exist.
      if (command.executionMode === 'AUTO_CREATE' && linkedTransactionId) {
        // Fire-and-await: rollback failure is non-fatal — original error always surfaces.
        await this.billTransactionPort.rollbackExpenseTransaction(linkedTransactionId);
      }
      throw new BillApplicationError(
        'REPOSITORY_ERROR',
        `Atomic payment persistence failed: ${saveResult.error.message}`
      );
    }

    // Step 9 — Return Result DTO
    return {
      paymentId: payment.id.value,
      billId: bill.id.value,
      occurrenceKey,
      updatedNextDueDate: updatedBill.isArchived ? null : updatedBill.nextDueDate.value.toISOString(),
      isArchived: updatedBill.isArchived,
      linkedTransactionId,
    };
  }
}
