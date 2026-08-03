import {
  CreateExpenseTransactionUseCase,
  CreateIncomeTransactionUseCase,
  ExecuteTransferUseCase,
  UpdateTransactionUseCase,
  VoidTransactionUseCase,
  LoadTransactionsUseCase,
  LoadAccountLedgerUseCase,
} from '../../application';
import { TransactionTypeKind } from '../../domain';
import { TransactionViewModel } from '../models/TransactionViewModel';
import { TransactionViewModelMapper } from '../mappers/TransactionViewModelMapper';
import { LedgerProjectionDTO } from '../../application/queries/LoadAccountLedgerQueryUseCase';

export class TransactionController {
  constructor(
    public readonly createExpenseUseCase: CreateExpenseTransactionUseCase,
    public readonly createIncomeUseCase: CreateIncomeTransactionUseCase,
    public readonly executeTransferUseCase: ExecuteTransferUseCase,
    public readonly updateTransactionUseCase: UpdateTransactionUseCase,
    public readonly voidTransactionUseCase: VoidTransactionUseCase,
    public readonly loadTransactionsUseCase: LoadTransactionsUseCase,
    public readonly loadAccountLedgerUseCase: LoadAccountLedgerUseCase
  ) {
    Object.freeze(this);
  }

  public async loadTransactionsViewModel(query: {
    accountId: string;
    type?: TransactionTypeKind;
    categoryId?: string | null;
    startDate?: Date;
    endDate?: Date;
    includeVoided?: boolean;
  }): Promise<TransactionViewModel[]> {
    const transactions = await this.loadTransactionsUseCase.execute({
      accountId: query.accountId,
      type: query.type,
      categoryId: query.categoryId,
      startDate: query.startDate,
      endDate: query.endDate,
      includeArchived: query.includeVoided,
    });
    return transactions.map(TransactionViewModelMapper.mapToViewModel);
  }

  public async loadAccountLedgerSummary(accountId: string): Promise<LedgerProjectionDTO> {
    return await this.loadAccountLedgerUseCase.execute(accountId);
  }

  public async createExpense(data: {
    id: string;
    accountId: string;
    amount: number;
    currencyCode: string;
    description: string;
    categoryId?: string | null;
    transactionDate?: Date;
  }): Promise<TransactionViewModel> {
    const transaction = await this.createExpenseUseCase.execute(data);
    return TransactionViewModelMapper.mapToViewModel(transaction);
  }

  public async createIncome(data: {
    id: string;
    accountId: string;
    amount: number;
    currencyCode: string;
    description: string;
    categoryId?: string | null;
    transactionDate?: Date;
  }): Promise<TransactionViewModel> {
    const transaction = await this.createIncomeUseCase.execute(data);
    return TransactionViewModelMapper.mapToViewModel(transaction);
  }

  public async executeTransfer(data: {
    sourceTransactionId: string;
    destTransactionId: string;
    sourceAccountId: string;
    destAccountId: string;
    amount: number;
    currencyCode: string;
    description: string;
    transferGroupId: string;
    transactionDate?: Date;
  }): Promise<{ sourceEntry: TransactionViewModel; destEntry: TransactionViewModel }> {
    const { sourceEntry, destEntry } = await this.executeTransferUseCase.execute(data);
    return {
      sourceEntry: TransactionViewModelMapper.mapToViewModel(sourceEntry),
      destEntry: TransactionViewModelMapper.mapToViewModel(destEntry),
    };
  }

  public async updateTransaction(data: {
    id: string;
    amount?: number;
    description?: string;
    categoryId?: string | null;
    transactionDate?: Date;
  }): Promise<void> {
    await this.updateTransactionUseCase.execute({ transactionId: data.id });
  }

  public async voidTransaction(id: string, voidedAt?: Date): Promise<void> {
    await this.voidTransactionUseCase.execute(id, voidedAt);
  }
}
