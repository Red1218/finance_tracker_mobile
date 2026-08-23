import { IBillRepository } from '../application/ports/IBillRepository';
import { IBillPaymentRepository } from '../application/ports/IBillPaymentRepository';
import { IBillTransactionPort } from '../application/ports/IBillTransactionPort';
import { ICategoryRepository } from '../../categories/application/repositories/ICategoryRepository';
import { GetUpcomingBillsUseCase } from '../application/use-cases/GetUpcomingBillsUseCase';
import { MarkBillPaidUseCase } from '../application/use-cases/MarkBillPaidUseCase';
import { SupabaseBillRepository } from '../../../platform/persistence/bills/SupabaseBillRepository';
import { SupabaseBillPaymentRepository } from '../../../platform/persistence/bills/SupabaseBillPaymentRepository';
import { BillTransactionAdapter } from '../integration/BillTransactionAdapter';
import { TransactionsModule } from '../../transactions/composition/TransactionsModule';

export interface BillsModuleOptions {
  billRepository?: IBillRepository;
  billPaymentRepository?: IBillPaymentRepository;
  billTransactionPort?: IBillTransactionPort;
  categoryRepository?: ICategoryRepository;
  transactionsModule?: TransactionsModule;
}

export class BillsModule {
  public readonly billRepository: IBillRepository;
  public readonly billPaymentRepository: IBillPaymentRepository;
  public readonly billTransactionPort: IBillTransactionPort;
  public readonly categoryRepository?: ICategoryRepository;

  public readonly getUpcomingBillsUseCase: GetUpcomingBillsUseCase;
  public readonly markBillPaidUseCase: MarkBillPaidUseCase;

  constructor(options: BillsModuleOptions = {}) {
    this.billRepository = options.billRepository ?? new SupabaseBillRepository();
    this.billPaymentRepository = options.billPaymentRepository ?? new SupabaseBillPaymentRepository();
    this.categoryRepository = options.categoryRepository;

    if (options.billTransactionPort) {
      this.billTransactionPort = options.billTransactionPort;
    } else {
      const txModule = options.transactionsModule ?? new TransactionsModule();
      this.billTransactionPort = new BillTransactionAdapter(
        txModule.createExpenseUseCase,
        txModule.transactionRepository,
        txModule.voidTransactionUseCase
      );
    }

    this.getUpcomingBillsUseCase = new GetUpcomingBillsUseCase(
      this.billRepository,
      this.categoryRepository
    );

    this.markBillPaidUseCase = new MarkBillPaidUseCase(
      this.billRepository,
      this.billPaymentRepository,
      this.billTransactionPort
    );

    Object.freeze(this);
  }
}
