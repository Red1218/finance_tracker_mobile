import {
  InitializeAccountsUseCase,
  LoadAccountsUseCase,
  LoadAccountUseCase,
  CreateAccountUseCase,
  RenameAccountUseCase,
  ArchiveAccountUseCase,
  RestoreAccountUseCase,
  SetDefaultAccountUseCase,
} from '../../application';
import { AccountTypeKind } from '../../domain';
import { AccountViewModel } from '../models/AccountViewModel';
import { AccountViewModelMapper } from '../mappers/AccountViewModelMapper';

export class AccountController {
  constructor(
    public readonly initializeAccountsUseCase: InitializeAccountsUseCase,
    public readonly loadAccountsUseCase: LoadAccountsUseCase,
    public readonly loadAccountUseCase: LoadAccountUseCase,
    public readonly createAccountUseCase: CreateAccountUseCase,
    public readonly renameAccountUseCase: RenameAccountUseCase,
    public readonly archiveAccountUseCase: ArchiveAccountUseCase,
    public readonly restoreAccountUseCase: RestoreAccountUseCase,
    public readonly setDefaultAccountUseCase: SetDefaultAccountUseCase
  ) {
    Object.freeze(this);
  }

  public async loadAccountsViewModel(includeArchived = false): Promise<AccountViewModel[]> {
    await this.initializeAccountsUseCase.execute();
    const accounts = await this.loadAccountsUseCase.execute({ includeArchived });
    return accounts.map((acc) => AccountViewModelMapper.mapToViewModel(acc as any));
  }

  public async loadAccountViewModel(accountId: string): Promise<AccountViewModel | null> {
    const account = await this.loadAccountUseCase.execute({ accountId });
    return account ? AccountViewModelMapper.mapToViewModel(account as any) : null;
  }

  public async createAccount(data: {
    name: string;
    type: AccountTypeKind;
    currencyCode?: string;
    openingBalance?: number;
    isDefault?: boolean;
  }): Promise<AccountViewModel> {
    const account = await this.createAccountUseCase.execute(data);
    return AccountViewModelMapper.mapToViewModel(account as any);
  }

  public async renameAccount(accountId: string, newName: string): Promise<AccountViewModel> {
    const account = await this.renameAccountUseCase.execute({ accountId, newName });
    return AccountViewModelMapper.mapToViewModel(account as any);
  }

  public async archiveAccount(accountId: string): Promise<void> {
    await this.archiveAccountUseCase.execute({ accountId });
  }

  public async restoreAccount(accountId: string): Promise<void> {
    await this.restoreAccountUseCase.execute({ accountId });
  }

  public async setDefaultAccount(accountId: string): Promise<void> {
    await this.setDefaultAccountUseCase.execute({ accountId });
  }
}
