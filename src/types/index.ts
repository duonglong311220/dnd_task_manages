export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

export interface TransactionFormData {
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  month: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

