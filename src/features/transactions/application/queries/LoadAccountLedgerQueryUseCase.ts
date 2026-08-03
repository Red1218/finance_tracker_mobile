import { AccountId } from '../../../accounts/domain';
import { IAccountRepository } from '../../../accounts/application/repositories/IAccountRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { TransactionDTO } from '../dto/TransactionDTO';
import { TransactionDTOMapper } from '../mappers/TransactionDTOMapper';
import { AccountNotFoundError } from '../../../accounts/application/errors/AccountApplicationError';

export interface LedgerProjectionDTO {
  accountId: string;
  accountName: string;
  openingBalance: number;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
  transactions: TransactionDTO[];
}

export class LoadAccountLedgerQueryUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository
  ) {
    Object.freeze(this);
  }

  public async execute(accountId: string): Promise<LedgerProjectionDTO> {
    const accId = new AccountId(accountId);
    const accResult = await this.accountRepository.getById(accId);

    if (!accResult.success || !accResult.data) {
      throw new AccountNotFoundError(accountId);
    }
    const account = accResult.data;

    const txResult = await this.transactionRepository.getByAccountId(accId, { includeVoided: false });
    if (!txResult.success) {
      throw txResult.error;
    }

    const transactions = txResult.data;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfersIn = 0;
    let totalTransfersOut = 0;

    for (const t of transactions) {
      if (t.type.isIncome()) {
        totalIncome += t.amount.value;
      } else if (t.type.isExpense()) {
        totalExpense += t.amount.value;
      } else if (t.type.isTransferIn()) {
        totalTransfersIn += t.amount.value;
      } else if (t.type.isTransferOut()) {
        totalTransfersOut += t.amount.value;
      }
    }

    const netMovement = totalIncome + totalTransfersIn - (totalExpense + totalTransfersOut);
    const currentBalance = account.openingBalance.value + netMovement;

    return Object.freeze({
      accountId: account.id.value,
      accountName: account.name.value,
      openingBalance: account.openingBalance.value,
      currentBalance,
      totalIncome,
      totalExpense,
      totalTransfersIn,
      totalTransfersOut,
      transactions: transactions.map((t) => TransactionDTOMapper.toDTO(t)),
    });
  }
}
