import { useState, useEffect, useCallback } from 'react';
import { budgetService, Budget, BudgetStatus } from '../services/api';
import { useSnackbar } from '../components/common/Snackbar';

export const useBudget = () => {
  const [currentBudget, setCurrentBudget] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchCurrentBudget = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await budgetService.getCurrent();
      setCurrentBudget(data ?? null);
    } catch (error: any) {
      showSnackbar(
        error?.response?.data?.message || 'Failed to load budget',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCurrentBudget();
  }, [fetchCurrentBudget]);

  const refresh = useCallback(() => {
    fetchCurrentBudget(true);
  }, [fetchCurrentBudget]);

  const createBudget = useCallback(
    async (data: Omit<Budget, 'id'>) => {
      try {
        await budgetService.create(data);
        await fetchCurrentBudget();
        showSnackbar('Budget created successfully', 'success');
        return { success: true };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create budget';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar, fetchCurrentBudget]
  );

  const updateBudget = useCallback(
    async (id: string, data: Partial<Budget>) => {
      try {
        await budgetService.update(id, data);
        await fetchCurrentBudget();
        showSnackbar('Budget updated successfully', 'success');
        return { success: true };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update budget';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar, fetchCurrentBudget]
  );

  return {
    currentBudget,
    loading,
    refreshing,
    refresh,
    createBudget,
    updateBudget,
  };
};
