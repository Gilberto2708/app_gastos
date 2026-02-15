import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '../services/api';
import { useSnackbar } from '../components/common/Snackbar';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await categoryService.getAll();
      setCategories(data ?? []);
    } catch (error: any) {
      showSnackbar(
        error?.response?.data?.message || 'Failed to load categories',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (data: Omit<Category, 'id'>) => {
      try {
        const newCategory = await categoryService.create(data);
        setCategories(prev => [...(prev ?? []), newCategory]);
        showSnackbar('Category created successfully', 'success');
        return { success: true, data: newCategory };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create category';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      try {
        const updated = await categoryService.update(id, data);
        setCategories(prev =>
          (prev ?? []).map(cat => (cat?.id === id ? updated : cat))
        );
        showSnackbar('Category updated successfully', 'success');
        return { success: true, data: updated };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update category';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await categoryService.delete(id);
        setCategories(prev => (prev ?? []).filter(cat => cat?.id !== id));
        showSnackbar('Category deleted successfully', 'success');
        return { success: true };
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete category';
        showSnackbar(message, 'error');
        return { success: false, error: message };
      }
    },
    [showSnackbar]
  );

  return {
    categories,
    loading,
    refreshing,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
