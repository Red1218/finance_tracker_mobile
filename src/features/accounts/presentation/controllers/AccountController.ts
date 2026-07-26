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
    const initResult = await this.initializeAccountsUseCase.execute();
    if (!initResult.success) {
      throw initResult.error;
    }

    const loadResult = await this.loadAccountsUseCase.execute({ includeArchived });
    if (!loadResult.success) {
      throw loadResult.error;
    }

    return loadResult.data.map((acc) => AccountViewModelMapper.mapToViewModel(acc));
  }

  public async loadAccountViewModel(accountId: string): Promise<AccountViewModel | null> {
    const result = await this.loadAccountUseCase.execute({ accountId });
    if (!result.success) {
      throw result.error;
    }
    return result.data ? AccountViewModelMapper.mapToViewModel(result.data) : null;
  }

  public async createAccount(data: {
    name: string;
    type: AccountTypeKind;
    currencyCode?: string;
    openingBalance?: number;
    isDefault?: boolean;
  }): Promise<AccountViewModel> {
    const result = await this.createAccountUseCase.execute(data);
    if (!result.success) {
      throw result.error;
    }
    return AccountViewModelMapper.mapToViewModel(result.data);
  }

  public async renameAccount(accountId: string, newName: string): Promise<AccountViewModel> {
    const result = await this.renameAccountUseCase.execute({ accountId, newName });
    if (!result.success) {
      throw result.error;
    }
    return AccountViewModelMapper.mapToViewModel(result.data);
  }

  public async archiveAccount(accountId: string): Promise<void> {
    const result = await this.archiveAccountUseCase.execute({ accountId });
    if (!result.success) {
      throw result.error;
    }
  }

  public async restoreAccount(accountId: string): Promise<void> {
    const result = await this.restoreAccountUseCase.execute({ accountId });
    if (!result.success) {
      throw result.error;
    }
  }

  public async setDefaultAccount(accountId: string): Promise<void> {
    const result = await this.setDefaultAccountUseCase.execute({ accountId });
    if (!result.success) {
      throw result.error;
    }
  }
}
