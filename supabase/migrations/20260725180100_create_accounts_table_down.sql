-- Migration Rollback: 20260725180100_create_accounts_table_down
-- Description: Drops accounts table and associated indexes.

DROP TABLE IF EXISTS public.accounts;
