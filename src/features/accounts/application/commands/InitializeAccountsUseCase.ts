import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../domain';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';
import { v4 as uuidv4 } from 'uuid';

export class InitializeAccountsUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(): Promise<AccountDTO[]> {
    const defaultAccountResult = await this.accountRepository.getDefault();
    if (defaultAccountResult.success && defaultAccountResult.data) {
      return [AccountDTOMapper.toDTO(defaultAccountResult.data)];
    }

    const listResult = await this.accountRepository.getAll(true);

    if (listResult.success && listResult.data.length > 0) {
      return listResult.data.map(acc => AccountDTOMapper.toDTO(acc));
    }

    const defaultAccount = new Account({
      id: new AccountId(uuidv4()),
      name: new AccountName('Cash Wallet'),
      type: new AccountType(AccountTypeKind.Cash),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(0),
      isDefault: true,
    });

    const saveResult = await this.accountRepository.save(defaultAccount);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return [AccountDTOMapper.toDTO(defaultAccount)];
  }
}
