import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { theme, spacing } from '../../config/theme';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getCurrentWeekRange, formatDateRange } from '../../utils/dateUtils';
import { statsService, expenseService, Expense } from '../../services/api';
import { useBudget } from '../../hooks/useBudget';
import { useSnackbar } from '../../components/common/Snackbar';
import AddExpenseModal from '../expenses/AddExpenseModal';
import { useAuth } from '../../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const { logout } = useAuth();
  const { currentBudget, refresh: refreshBudget } = useBudget();
  const { showSnackbar } = useSnackbar();
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState({ start: '', end: '' });

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const weekRange = getCurrentWeekRange();
      setCurrentWeek(weekRange);

      const [stats, expenses] = await Promise.all([
        statsService.getWeekly(weekRange.start),
        expenseService.getAll({
          startDate: weekRange.start,
          endDate: weekRange.end,
        }),
      ]);

      setWeeklyTotal(stats?.total ?? 0);
      setCategoryStats(stats?.byCategory ?? []);
      setRecentExpenses((expenses?.expenses ?? []).slice(0, 10));
      
      if (isRefresh) {
        refreshBudget();
      }
    } catch (error: any) {
      showSnackbar(
        error?.response?.data?.message || 'Failed to load dashboard data',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    loadData(true);
  };

  const getBudgetStatus = () => {
    const percentage = currentBudget?.percentage ?? 0;
    if (percentage >= 100) return { color: theme.colors.error, text: 'Budget Exceeded!' };
    if (percentage >= 80) return { color: theme.colors.warning, text: 'Budget Alert' };
    return { color: theme.colors.success, text: 'On Track' };
  };

  const getPieChartData = () => {
    return (categoryStats ?? []).map((stat, index) => ({
      name: stat?.categoryName ?? '',
      amount: stat?.total ?? 0,
      color: stat?.categoryColor ?? theme.colors.primary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Dashboard
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {currentWeek?.start && currentWeek?.end
              ? formatDateRange(currentWeek.start, currentWeek.end)
              : 'This Week'}
          </Text>
        </View>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.totalCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Weekly Total
            </Text>
            <Text variant="displayMedium" style={styles.totalAmount}>
              {formatCurrency(weeklyTotal)}
            </Text>
          </Card.Content>
        </Card>

        {currentBudget?.budget && (
          <Card style={styles.budgetCard}>
            <Card.Content>
              <View style={styles.budgetHeader}>
                <Text variant="titleMedium">
                  Budget ({currentBudget?.budget?.type ?? ''})
                </Text>
                <Text
                  variant="titleSmall"
                  style={[styles.budgetStatus, { color: getBudgetStatus().color }]}
                >
                  {getBudgetStatus().text}
                </Text>
              </View>
              <View style={styles.budgetAmounts}>
                <View>
                  <Text variant="bodySmall">Spent</Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.error }}>
                    {formatCurrency(currentBudget?.spent ?? 0)}
                  </Text>
                </View>
                <View style={styles.budgetDivider} />
                <View>
                  <Text variant="bodySmall">Remaining</Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.success }}>
                    {formatCurrency(currentBudget?.remaining ?? 0)}
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={(currentBudget?.percentage ?? 0) / 100}
                color={getBudgetStatus().color}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.progressText}>
                {currentBudget?.percentage?.toFixed?.(1) ?? 0}% of budget used
              </Text>
            </Card.Content>
          </Card>
        )}

        {categoryStats?.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Expenses by Category
              </Text>
              <PieChart
                data={getPieChartData()}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card.Content>
          </Card>
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Expenses
        </Text>

        {recentExpenses?.length === 0 ? (
          <EmptyState
            icon="receipt-text-outline"
            title="No expenses yet"
            message="Start tracking by adding your first expense"
            actionLabel="Add Expense"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          recentExpenses?.map?.(expense => (
            <Surface key={expense?.id} style={styles.expenseItem}>
              <View
                style={[
                  styles.categoryIndicator,
                  { backgroundColor: expense?.category?.color ?? theme.colors.primary },
                ]}
              />
              <View style={styles.expenseContent}>
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <MaterialCommunityIcons
                      name={(expense?.category?.icon as any) ?? 'cash'}
                      size={24}
                      color={expense?.category?.color ?? theme.colors.primary}
                    />
                    <View style={styles.expenseText}>
                      <Text variant="bodyLarge" style={styles.expenseDescription}>
                        {expense?.description ?? ''}
                      </Text>
                      <Text variant="bodySmall" style={styles.expenseCategory}>
                        {expense?.category?.name ?? ''} •{' '}
                        {formatDate(expense?.date ?? '')}
                      </Text>
                    </View>
                  </View>
                  <Text variant="titleMedium" style={styles.expenseAmount}>
                    {formatCurrency(expense?.amount ?? 0)}
                  </Text>
                </View>
              </View>
            </Surface>
          )) ?? []
        )}
      </ScrollView>

      <FAB icon="plus" onPress={() => setShowAddModal(true)} />

      <AddExpenseModal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadData();
        }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  totalCard: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
  },
  cardTitle: {
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  totalAmount: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  budgetCard: {
    marginBottom: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  budgetStatus: {
    fontWeight: 'bold',
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  budgetDivider: {
    width: 1,
    backgroundColor: theme.colors.outline,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  expenseItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
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
    alignItems: 'center',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  expenseDescription: {
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  expenseCategory: {
    color: theme.colors.onSurfaceVariant,
  },
  expenseAmount: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
