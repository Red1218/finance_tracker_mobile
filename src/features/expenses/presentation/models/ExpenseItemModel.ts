export interface ExpenseItemModel {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  date: number;
  formattedDate: string;
  paymentMethod: string;
  note?: string;
  merchant?: string;
  isDeleted: boolean;
}
