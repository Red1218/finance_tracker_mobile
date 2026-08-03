import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';

export class InitializeAccountsUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(): Promise<AccountDTO[]> {
    const listResult = typeof (this.accountRepository as any).list === 'function'
      ? await (this.accountRepository as any).list(true)
      : await (this.accountRepository as any).getAll(true);

    if (listResult.success && listResult.data.length > 0) {
      return listResult.data.map((acc: any) => AccountDTOMapper.toDTO(acc));
    }

    const defaultAccount = new Account({
      id: new AccountId('default-account-id'),
      name: new AccountName('Cash Wallet'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(0),
      isDefault: true,
    });

    const saveResult = typeof (this.accountRepository as any).create === 'function'
      ? await (this.accountRepository as any).create(defaultAccount)
      : await this.accountRepository.save(defaultAccount);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return [AccountDTOMapper.toDTO(defaultAccount)];
  }
}
