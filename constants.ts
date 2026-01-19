
import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'housing', name: 'Habitação', icon: '🏠', color: '#3b82f6' },
  { id: 'food', name: 'Alimentação', icon: '🍕', color: '#ef4444' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#10b981' },
  { id: 'entertainment', name: 'Lazer', icon: '🎮', color: '#8b5cf6' },
  { id: 'health', name: 'Saúde', icon: '🏥', color: '#f59e0b' },
  { id: 'education', name: 'Educação', icon: '📚', color: '#6366f1' },
  { id: 'income', name: 'Renda', icon: '💰', color: '#22c55e' },
  { id: 'others', name: 'Outros', icon: '📦', color: '#94a3b8' },
];

export const INITIAL_TRANSACTIONS = [
  { id: '1', description: 'Salário Mensal', amount: 5000, type: 'INCOME' as const, category: 'income', date: '2024-05-01' },
  { id: '2', description: 'Aluguel', amount: 1500, type: 'EXPENSE' as const, category: 'housing', date: '2024-05-05' },
  { id: '3', description: 'Supermercado', amount: 600, type: 'EXPENSE' as const, category: 'food', date: '2024-05-10' },
  { id: '4', description: 'Combustível', amount: 300, type: 'EXPENSE' as const, category: 'transport', date: '2024-05-12' },
];
