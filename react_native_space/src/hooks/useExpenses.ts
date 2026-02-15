import { useState, useCallback } from 'react';
import { expenseService, Expense } from '../services/api';
import { useSnackbar } from '../components/common/Snackbar';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchExpenses = useCallback(
    async (
      params?: {
        startDate?: string;
        endDate?: string;
        categoryId?: string;
      },
      isRefresh = false
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await expenseService.getAll(params);
        setExpenses(data?.expenses ?? []);
        setTotal(data?.total ?? 0);
      } catch (error: any) {
        showSnackbar(
          error?.response?.data?.message || 'Failed to load expenses',
          'error'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showSnackbar]
  );

  const createExpense = useCallback(
    async (data: Omit<Expense, 'id'>) => {
      try {
        const newExpense = await expenseService.create(data);
        setExpenses(prev => [newExpense, ...(prev ?? [])]);
        showSnackbar('Expense added successfully', 'success');
        return { success: true, data: newExpense };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to add expense';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  const updateExpense = useCallback(
    async (id: string, data: Partial<Expense>) => {
      try {
        const updated = await expenseService.update(id, data);
        setExpenses(prev =>
          (prev ?? []).map(exp => (exp?.id === id ? updated : exp))
        );
        showSnackbar('Expense updated successfully', 'success');
        return { success: true, data: updated };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update expense';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        await expenseService.delete(id);
        setExpenses(prev => (prev ?? []).filter(exp => exp?.id !== id));
        showSnackbar('Expense deleted successfully', 'success');
        return { success: true };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete expense';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  return {
    expenses,
    total,
    loading,
    refreshing,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
