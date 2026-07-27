CREATE TYPE payment_method_enum AS ENUM (
    'CASH',
    'UPI',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'OTHER'
);

COMMENT ON TYPE payment_method_enum IS
'Supported payment methods for financial transactions.';