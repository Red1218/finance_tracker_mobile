export interface TransactionFormFields {
  accountId: string;
  destAccountId?: string;
  amountStr: string;
  description: string;
}

export type TransactionFormValidationErrors = { [key: string]: string };

/**
 * Shared between the full form (3c) and the amount-first quick-add (3b) -
 * both submit through the same TransactionFormValues contract, so both
 * validate against the same rules rather than each hand-rolling its own.
 */
export function validateTransactionFormFields(
  fields: TransactionFormFields,
  mode: 'expense' | 'income' | 'transfer'
): TransactionFormValidationErrors {
  const errors: TransactionFormValidationErrors = {};

  if (!fields.accountId) {
    errors.accountId = 'Please select an account';
  }

  if (mode === 'transfer') {
    if (!fields.destAccountId) {
      errors.destAccountId = 'Please select a destination account';
    } else if (fields.destAccountId === fields.accountId) {
      errors.destAccountId = 'Destination account must differ from source account';
    }
  }

  const parsedAmount = parseFloat(fields.amountStr);
  if (!fields.amountStr.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Amount must be greater than zero';
  }

  if (!fields.description.trim()) {
    errors.description = 'Description is required';
  } else if (fields.description.length > 255) {
    errors.description = 'Description cannot exceed 255 characters';
  }

  return errors;
}
