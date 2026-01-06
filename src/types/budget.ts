export interface Category {
  id: string;
  name: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'debit' | 'credit';

export interface Spend {
  id: string;
  dateISO: string;
  amount: number;
  categoryId: string;
  note?: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string;
}

export type BorrowingType = 'personal' | 'loan_app' | 'friend' | 'credit_provider' | 'other';

export interface Borrowing {
  id: string;
  type: BorrowingType;
  amount: number;
  from: string;
  note?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  isDefault?: boolean;
}

export interface Saving {
  id: string;
  amount: number;
  note?: string;
  dateISO: string;
}

export interface BudgetData {
  categories: Category[];
  spends: Spend[];
  borrowings: Borrowing[];
  creditCards: CreditCard[];
  savings: Saving[];
  budgetLimit: number;
}

export const defaultBudgetData: BudgetData = {
  categories: [],
  spends: [],
  borrowings: [],
  creditCards: [],
  savings: [],
  budgetLimit: 0,
};

export const DEFAULT_CATEGORIES = [
  'Grocery',
  'Electricity',
  'Rent',
  'Travel',
  'Food & Dining',
  'Entertainment',
  'Shopping',
];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  debit: 'Debit Card',
  credit: 'Credit Card',
};

export const borrowingTypeLabels: Record<BorrowingType, string> = {
  personal: 'Personal Loan',
  loan_app: 'Loan App',
  friend: 'Friend',
  credit_provider: 'Credit Provider',
  other: 'Other',
};
