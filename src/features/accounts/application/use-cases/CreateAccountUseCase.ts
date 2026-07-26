import { IAccountRepository } from '../repositories/IAccountRepository';
import {
  Account,
  AccountId,
  AccountName,
  AccountType,
  AccountTypeKind,
  CurrencyCode,
  OpeningBalance,
  AccountDomainError,
} from '../../domain';
import { RepositoryResult, Result } from '../../../../platform/persistence';

export interface CreateAccountRequest {
  id?: string;
  name: string;
  type: AccountTypeKind;
  currencyCode?: string;
  openingBalance?: number;
  isDefault?: boolean;
}

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(request: CreateAccountRequest): Promise<RepositoryResult<Account, Error>> {
    try {
      const name = new AccountName(request.name);
      const existsResult = await this.accountRepository.existsByName(name.value);
      if (!existsResult.success) {
        return existsResult as RepositoryResult<never, Error>;
      }

      if (existsResult.data) {
        return Result.failure(
          new AccountDomainError(
            'DUPLICATE_ACCOUNT_NAME',
            `An active account with name "${name.value}" already exists.`
          )
        );
      }

      const countResult = await this.accountRepository.getActiveCount();
      if (!countResult.success) {
        return countResult as RepositoryResult<never, Error>;
      }

      const isFirstAccount = countResult.data === 0;
      const shouldBeDefault = isFirstAccount ? true : (request.isDefault ?? false);

      const accountId = request.id ? new AccountId(request.id) : new AccountId(`acc-${Date.now()}`);
      const type = new AccountType(request.type);
      const currencyCode = new CurrencyCode(request.currencyCode ?? 'INR');
      const openingBalance = new OpeningBalance(request.openingBalance ?? 0);

      const account = new Account({
        id: accountId,
        name,
        type,
        currencyCode,
        openingBalance,
        isDefault: shouldBeDefault,
        archivedAt: null,
      });

      const saveResult = await this.accountRepository.save(account);
      if (!saveResult.success) {
        return saveResult as RepositoryResult<never, Error>;
      }

      if (shouldBeDefault && !isFirstAccount) {
        const defaultResult = await this.accountRepository.setDefaultAccount(account.id);
        if (!defaultResult.success) {
          return defaultResult as RepositoryResult<never, Error>;
        }
      }

      return Result.success(account);
    } catch (e) {
      return Result.failure(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
