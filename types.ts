
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  categoriesBreakdown: { name: string; value: number; color: string }[];
}

export interface AIInsight {
  title: string;
  message: string;
  type: 'TIP' | 'WARNING' | 'OPPORTUNITY';
}
