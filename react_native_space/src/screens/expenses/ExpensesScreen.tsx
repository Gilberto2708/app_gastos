import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
} from 'react-native';
import {
  Text,
  Surface,
  Chip,
  Menu,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme, spacing } from '../../config/theme';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate, getDateRangePreset } from '../../utils/dateUtils';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { Expense } from '../../services/api';
import AddExpenseModal from './AddExpenseModal';
import DateRangeModal from './DateRangeModal';

const ExpensesScreen = () => {
  const { expenses, total, loading, refreshing, fetchExpenses, deleteExpense } = useExpenses();
  const { categories } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const preset = getDateRangePreset('thisMonth');
      if (preset) {
        setDateRange({ start: preset.startDate, end: preset.endDate });
        fetchExpenses({
          startDate: preset.startDate,
          endDate: preset.endDate,
          categoryId: categoryFilter ?? undefined,
        });
      }
    }, [categoryFilter])
  );

  const onRefresh = () => {
    fetchExpenses(
      {
        startDate: dateRange?.start,
        endDate: dateRange?.end,
        categoryId: categoryFilter ?? undefined,
      },
      true
    );
  };

  const handleDelete = async () => {
    if (deletingExpense?.id) {
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
      onRefresh();
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleDateRangeApply = (start: string, end: string) => {
    setDateRange({ start, end });
    fetchExpenses({
      startDate: start,
      endDate: end,
      categoryId: categoryFilter ?? undefined,
    });
    setShowDateRangeModal(false);
  };

  const clearFilters = () => {
    setCategoryFilter(null);
    setDateRange(null);
    fetchExpenses({});
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Surface style={styles.expenseItem}>
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: item?.category?.color ?? theme.colors.primary },
        ]}
      />
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <MaterialCommunityIcons
              name={(item?.category?.icon as any) ?? 'cash'}
              size={28}
              color={item?.category?.color ?? theme.colors.primary}
            />
            <View style={styles.expenseText}>
              <Text variant="bodyLarge" style={styles.description}>
                {item?.description ?? ''}
              </Text>
              <Text variant="bodySmall" style={styles.metadata}>
                {item?.category?.name ?? ''} • {formatDate(item?.date ?? '')}
              </Text>
            </View>
          </View>
          <Text variant="titleMedium" style={styles.amount}>
            {formatCurrency(item?.amount ?? 0)}
          </Text>
        </View>
        {item?.receiptUrl && (
          <Image source={{ uri: item.receiptUrl }} style={styles.receiptThumbnail} />
        )}
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEdit(item)}
            accessibilityLabel="Edit expense"
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => setDeletingExpense(item)}
            accessibilityLabel="Delete expense"
          />
        </View>
      </View>
    </Surface>
  );

  const selectedCategory = categories?.find?.(c => c?.id === categoryFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Expenses
        </Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <Chip
            icon="calendar"
            mode="outlined"
            onPress={() => setShowDateRangeModal(true)}
            style={styles.filterChip}
          >
            {dateRange
              ? `${formatDate(dateRange.start, 'MMM dd')} - ${formatDate(dateRange.end, 'MMM dd')}`
              : 'Date Range'}
          </Chip>

          <Menu
            visible={showCategoryMenu}
            onDismiss={() => setShowCategoryMenu(false)}
            anchor={
              <Chip
                icon="shape"
                mode="outlined"
                onPress={() => setShowCategoryMenu(true)}
                style={styles.filterChip}
              >
                {selectedCategory?.name ?? 'All Categories'}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setCategoryFilter(null);
                setShowCategoryMenu(false);
              }}
              title="All Categories"
            />
            <Divider />
            {categories?.map?.(category => (
              <Menu.Item
                key={category?.id}
                onPress={() => {
                  setCategoryFilter(category?.id ?? null);
                  setShowCategoryMenu(false);
                }}
                title={category?.name ?? ''}
              />
            )) ?? []}
          </Menu>

          {(categoryFilter || dateRange) && (
            <IconButton
              icon="close-circle"
              size={20}
              onPress={clearFilters}
              accessibilityLabel="Clear filters"
            />
          )}
        </View>

        <Surface style={styles.totalBar}>
          <Text variant="titleMedium">Total:</Text>
          <Text variant="titleLarge" style={styles.totalAmount}>
            {formatCurrency(total)}
          </Text>
        </Surface>
      </View>

      <FlatList
        data={expenses ?? []}
        renderItem={renderExpenseItem}
        keyExtractor={item => item?.id ?? ''}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-text-outline"
            title="No expenses found"
            message="Add your first expense or adjust filters"
            actionLabel="Add Expense"
            onAction={() => setShowAddModal(true)}
          />
        }
      />

      <FAB icon="plus" onPress={() => setShowAddModal(true)} />

      <AddExpenseModal
        visible={showAddModal}
        expense={editingExpense}
        onDismiss={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingExpense(null);
          onRefresh();
        }}
      />

      <DateRangeModal
        visible={showDateRangeModal}
        onDismiss={() => setShowDateRangeModal(false)}
        onApply={handleDateRangeApply}
        initialStartDate={dateRange?.start}
        initialEndDate={dateRange?.end}
      />

      <ConfirmDialog
        visible={!!deletingExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingExpense(null)}
        confirmText="Delete"
        destructive
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  filters: {
    padding: spacing.md,
    paddingTop: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
  },
  totalAmount: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  expenseItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  categoryIndicator: {
    width: 4,
  },
  expenseContent: {
    flex: 1,
    padding: spacing.md,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  expenseText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  description: {
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  metadata: {
    color: theme.colors.onSurfaceVariant,
  },
  amount: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  receiptThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
});

export default ExpensesScreen;
