import {
  ITransactionRepository,
  CreateExpenseTransactionUseCase,
  CreateIncomeTransactionUseCase,
  ExecuteTransferUseCase,
  UpdateTransactionUseCase,
  VoidTransactionUseCase,
  LoadTransactionsUseCase,
  LoadAccountLedgerUseCase,
} from '../application';
import { IAccountRepository } from '../../accounts/application';
import { SupabaseTransactionRepository } from '../../../platform/persistence/transactions/SupabaseTransactionRepository';
import { SupabaseAccountRepository } from '../../../platform/persistence/accounts/SupabaseAccountRepository';
import { TransactionController } from '../presentation/controllers/TransactionController';

export class TransactionsModule {
  public readonly transactionRepository: ITransactionRepository;
  public readonly accountRepository: IAccountRepository;

  public readonly createExpenseUseCase: CreateExpenseTransactionUseCase;
  public readonly createIncomeUseCase: CreateIncomeTransactionUseCase;
  public readonly executeTransferUseCase: ExecuteTransferUseCase;
  public readonly updateTransactionUseCase: UpdateTransactionUseCase;
  public readonly voidTransactionUseCase: VoidTransactionUseCase;
  public readonly loadTransactionsUseCase: LoadTransactionsUseCase;
  public readonly loadAccountLedgerUseCase: LoadAccountLedgerUseCase;

  public readonly controller: TransactionController;

  constructor(
    transactionRepository?: ITransactionRepository,
    accountRepository?: IAccountRepository
  ) {
    this.transactionRepository = transactionRepository ?? new SupabaseTransactionRepository();
    this.accountRepository = accountRepository ?? new SupabaseAccountRepository();

    this.createExpenseUseCase = new CreateExpenseTransactionUseCase(
      this.transactionRepository,
      this.accountRepository
    );
    this.createIncomeUseCase = new CreateIncomeTransactionUseCase(
      this.transactionRepository,
      this.accountRepository
    );
    this.executeTransferUseCase = new ExecuteTransferUseCase(
      this.transactionRepository,
      this.accountRepository
    );
    this.updateTransactionUseCase = new UpdateTransactionUseCase(this.transactionRepository);
    this.voidTransactionUseCase = new VoidTransactionUseCase(this.transactionRepository);
    this.loadTransactionsUseCase = new LoadTransactionsUseCase(this.transactionRepository);
    this.loadAccountLedgerUseCase = new LoadAccountLedgerUseCase(this.transactionRepository, this.accountRepository);

    this.controller = new TransactionController(
      this.createExpenseUseCase,
      this.createIncomeUseCase,
      this.executeTransferUseCase,
      this.updateTransactionUseCase,
      this.voidTransactionUseCase,
      this.loadTransactionsUseCase,
      this.loadAccountLedgerUseCase
    );

    Object.freeze(this);
  }
}
