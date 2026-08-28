import {
  Account,
  AccountId,
  AccountName,
  AccountType,
  CurrencyCode,
  OpeningBalance,
} from '../../domain';
import { IAccountRepository } from '../repositories/IAccountRepository';
import { CreateAccountCommand } from './CreateAccountCommand';
import { AccountDTO } from '../dto/AccountDTO';
import { AccountDTOMapper } from '../mappers/AccountDTOMapper';
import { DuplicateAccountNameError } from '../errors/AccountApplicationError';

import { generateUUID } from '../../../../core/utils/uuid';

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: IAccountRepository) {
    Object.freeze(this);
  }

  public async execute(command: CreateAccountCommand): Promise<AccountDTO> {
    const existsResult = await this.accountRepository.existsByName(command.name);
    if (existsResult.success && existsResult.data) {
      throw new DuplicateAccountNameError(command.name);
    }

    const account = new Account({
      id: new AccountId(command.id || generateUUID()),

      name: new AccountName(command.name),
      type: new AccountType(command.type as any),
      currencyCode: new CurrencyCode(command.currencyCode ?? 'INR'),
      openingBalance: new OpeningBalance(command.openingBalance ?? 0),
      isDefault: command.isDefault ?? false,
    });

    const saveResult = await this.accountRepository.save(account);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return AccountDTOMapper.toDTO(account);
  }
}
