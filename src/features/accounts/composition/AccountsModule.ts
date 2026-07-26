import {
  InitializeAccountsUseCase,
  LoadAccountsUseCase,
  LoadAccountUseCase,
  CreateAccountUseCase,
  RenameAccountUseCase,
  ArchiveAccountUseCase,
  RestoreAccountUseCase,
  SetDefaultAccountUseCase,
  IAccountRepository,
} from '../application';
import { SupabaseAccountRepository } from '../../../platform/persistence/accounts/SupabaseAccountRepository';
import { AccountController } from '../presentation/controllers/AccountController';

export class AccountsModule {
  public readonly accountRepository: IAccountRepository;
  public readonly controller: AccountController;
  public readonly initializeAccountsUseCase: InitializeAccountsUseCase;
  public readonly loadAccountsUseCase: LoadAccountsUseCase;
  public readonly loadAccountUseCase: LoadAccountUseCase;
  public readonly createAccountUseCase: CreateAccountUseCase;
  public readonly renameAccountUseCase: RenameAccountUseCase;
  public readonly archiveAccountUseCase: ArchiveAccountUseCase;
  public readonly restoreAccountUseCase: RestoreAccountUseCase;
  public readonly setDefaultAccountUseCase: SetDefaultAccountUseCase;

  constructor(repository?: IAccountRepository) {
    this.accountRepository = repository ?? new SupabaseAccountRepository();

    this.initializeAccountsUseCase = new InitializeAccountsUseCase(this.accountRepository);
    this.loadAccountsUseCase = new LoadAccountsUseCase(this.accountRepository);
    this.loadAccountUseCase = new LoadAccountUseCase(this.accountRepository);
    this.createAccountUseCase = new CreateAccountUseCase(this.accountRepository);
    this.renameAccountUseCase = new RenameAccountUseCase(this.accountRepository);
    this.archiveAccountUseCase = new ArchiveAccountUseCase(this.accountRepository);
    this.restoreAccountUseCase = new RestoreAccountUseCase(this.accountRepository);
    this.setDefaultAccountUseCase = new SetDefaultAccountUseCase(this.accountRepository);

    this.controller = new AccountController(
      this.initializeAccountsUseCase,
      this.loadAccountsUseCase,
      this.loadAccountUseCase,
      this.createAccountUseCase,
      this.renameAccountUseCase,
      this.archiveAccountUseCase,
      this.restoreAccountUseCase,
      this.setDefaultAccountUseCase
    );

    Object.freeze(this);
  }
}
