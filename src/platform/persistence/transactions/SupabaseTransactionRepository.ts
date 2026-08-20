import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import {
  ITransactionRepository,
  TransactionFilter,
  AccountLedgerSummary,
} from '../../../features/transactions/application/repositories/ITransactionRepository';
import {
  Transaction,
  TransactionId,
  TransferReference,
} from '../../../features/transactions/domain';
import { AccountId } from '../../../features/accounts/domain';
import { TransactionMapper } from './TransactionMapper';
import { TransactionRow } from '../../../features/transactions/contracts/TransactionRow';
import { supabase } from '../../../database';

export class SupabaseTransactionRepository extends BaseRepository implements ITransactionRepository {
  private static readonly TABLE = 'transactions';
  private static readonly COLUMNS =
    'id,user_id,account_id,category_id,type,amount,currency_code,description,transfer_group_id,occurred_at,created_at,updated_at,archived_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: TransactionId): Promise<RepositoryResult<Transaction | null, RepositoryError>> {
    return this.findById(id);
  }

  public async findById(id: TransactionId): Promise<RepositoryResult<Transaction | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .select(SupabaseTransactionRepository.COLUMNS)
        .eq('id', id.value)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'findById', id: id.value });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(TransactionMapper.toDomain(data as TransactionRow));
    } catch (e) {
      return this.handleError(e, { operation: 'findById', id: id.value });
    }
  }

  public async getByAccountId(
    accountId: AccountId,
    filter?: any
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    return this.listTransactions({ ...filter, accountId });
  }

  public async listTransactions(

    filter?: TransactionFilter
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseTransactionRepository.TABLE)
        .select(SupabaseTransactionRepository.COLUMNS);

      if (filter?.accountId) {
        query = query.eq('account_id', filter.accountId.value);
      }

      if (!filter?.includeVoided) {
        query = query.is('archived_at', null);
      }

      if (filter?.startDate) {
        query = query.gte('occurred_at', filter.startDate.toISOString());
      }

      if (filter?.endDate) {
        query = query.lte('occurred_at', filter.endDate.toISOString());
      }

      if (filter?.type) {
        query = query.eq('type', filter.type.kind);
      }

      if (filter?.categoryId !== undefined) {
        if (filter.categoryId === null) {
          query = query.is('category_id', null);
        } else {
          query = query.eq('category_id', filter.categoryId);
        }
      }

      query = query.order('occurred_at', { ascending: false }).order('id', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'listTransactions' });
      }


      const domainTransactions = (data as TransactionRow[]).map(TransactionMapper.toDomain);
      return Result.success(domainTransactions);
    } catch (e) {
      return this.handleError(e, { operation: 'listTransactions' });
    }
  }

  public async getByTransferGroupId(
    transferGroupId: TransferReference
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .select(SupabaseTransactionRepository.COLUMNS)
        .eq('transfer_group_id', transferGroupId.value);

      if (error) {
        return this.handleError(error, { operation: 'getByTransferGroupId', groupId: transferGroupId.value });
      }

      const domainTransactions = (data as TransactionRow[]).map(TransactionMapper.toDomain);
      return Result.success(domainTransactions);
    } catch (e) {
      return this.handleError(e, { operation: 'getByTransferGroupId', groupId: transferGroupId.value });
    }
  }

  public async save(transaction: Transaction): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const userRes = await this.client.auth.getUser();
      const userId = userRes.data.user?.id ?? 'system';
      const row = TransactionMapper.toPersistence(transaction, userId);

      const { error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .upsert(row, { onConflict: 'id' });

      if (error) {
        return this.handleError(error, { operation: 'save', id: transaction.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: transaction.id.value });
    }
  }

  public async saveMany(transactions: Transaction[]): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const userRes = await this.client.auth.getUser();
      const userId = userRes.data.user?.id ?? 'system';
      const rows = transactions.map((t) => TransactionMapper.toPersistence(t, userId));

      const { error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        return this.handleError(error, { operation: 'saveMany' });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'saveMany' });
    }
  }

  public async voidTransaction(
    id: TransactionId,
    voidedAt: Date = new Date()
  ): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .update({ archived_at: voidedAt.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id.value);

      if (error) {
        return this.handleError(error, { operation: 'voidTransaction', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'voidTransaction', id: id.value });
    }
  }

  public async voidTransferGroup(
    transferGroupId: TransferReference,
    voidedAt: Date = new Date()
  ): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .update({ archived_at: voidedAt.toISOString(), updated_at: new Date().toISOString() })
        .eq('transfer_group_id', transferGroupId.value);

      if (error) {
        return this.handleError(error, { operation: 'voidTransferGroup', groupId: transferGroupId.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'voidTransferGroup', groupId: transferGroupId.value });
    }
  }

  public async getAccountLedgerSummary(
    accountId: AccountId
  ): Promise<RepositoryResult<AccountLedgerSummary, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseTransactionRepository.TABLE)
        .select('type, amount')
        .eq('account_id', accountId.value)
        .is('archived_at', null);

      if (error) {
        return this.handleError(error, { operation: 'getAccountLedgerSummary', accountId: accountId.value });
      }

      let totalIncome = 0;
      let totalExpense = 0;
      let totalTransfersIn = 0;
      let totalTransfersOut = 0;

      for (const row of data || []) {
        const amt = Number(row.amount);
        switch (row.type) {
          case 'INCOME':
            totalIncome += amt;
            break;
          case 'EXPENSE':
            totalExpense += amt;
            break;
          case 'TRANSFER_IN':
            totalTransfersIn += amt;
            break;
          case 'TRANSFER_OUT':
            totalTransfersOut += amt;
            break;
        }
      }

      return Result.success({
        accountId,
        totalIncome,
        totalExpense,
        totalTransfersIn,
        totalTransfersOut,
      });
    } catch (e) {
      return this.handleError(e, { operation: 'getAccountLedgerSummary', accountId: accountId.value });
    }
  }
}
