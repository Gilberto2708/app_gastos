import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Text, Card, ProgressBar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { theme, spacing } from '../../config/theme';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { useBudget } from '../../hooks/useBudget';
import { statsService } from '../../services/api';
import SetBudgetModal from './SetBudgetModal';

const screenWidth = Dimensions.get('window').width;

const BudgetScreen = () => {
  const { currentBudget, loading, refreshing, refresh } = useBudget();
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);

  const loadWeeklyStats = async () => {
    try {
      const stats = await statsService.getWeekly();
      setWeeklyStats(stats?.byDay ?? []);
    } catch (error) {
      // Handle silently
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refresh();
      loadWeeklyStats();
    }, [])
  );

  const getBudgetStatus = () => {
    const percentage = currentBudget?.percentage ?? 0;
    if (percentage >= 100) return { color: theme.colors.error, text: 'Over Budget' };
    if (percentage >= 80) return { color: theme.colors.warning, text: 'Near Limit' };
    return { color: theme.colors.success, text: 'On Track' };
  };

  const getChartData = () => {
    const labels = (weeklyStats ?? []).map(stat => 
      formatDate(stat?.date ?? '', 'MMM dd').substring(0, 5)
    );
    const data = (weeklyStats ?? []).map(stat => stat?.total ?? 0);

    return {
      labels: labels?.length > 0 ? labels : [''],
      datasets: [
        {
          data: data?.length > 0 ? data : [0],
        },
      ],
    };
  };

  if (!currentBudget?.budget && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Budget
          </Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No budget set"
          message="Set a budget to track your spending limits"
          actionLabel="Set Budget"
          onAction={() => setShowSetBudgetModal(true)}
        />
        <SetBudgetModal
          visible={showSetBudgetModal}
          onDismiss={() => setShowSetBudgetModal(false)}
          onSuccess={() => {
            setShowSetBudgetModal(false);
            refresh();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Budget
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {currentBudget?.budget && (
          <>
            <Card style={styles.budgetCard}>
              <Card.Content>
                <View style={styles.budgetHeader}>
                  <Text variant="titleLarge">
                    {currentBudget?.budget?.type ?? ''} Budget
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[styles.statusText, { color: getBudgetStatus().color }]}
                  >
                    {getBudgetStatus().text}
                  </Text>
                </View>

                <Text variant="bodyMedium" style={styles.dateRange}>
                  {formatDate(currentBudget?.budget?.startDate ?? '')} -{' '}
                  {formatDate(currentBudget?.budget?.endDate ?? '')}
                </Text>

                <View style={styles.amountContainer}>
                  <View style={styles.amountBox}>
                    <Text variant="bodySmall" style={styles.label}>
                      Budget
                    </Text>
                    <Text variant="headlineSmall" style={styles.budgetAmount}>
                      {formatCurrency(currentBudget?.budget?.amount ?? 0)}
                    </Text>
                  </View>

                  <View style={styles.amountBox}>
                    <Text variant="bodySmall" style={styles.label}>
                      Spent
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={[styles.spentAmount, { color: theme.colors.error }]}
                    >
                      {formatCurrency(currentBudget?.spent ?? 0)}
                    </Text>
                  </View>

                  <View style={styles.amountBox}>
                    <Text variant="bodySmall" style={styles.label}>
                      Remaining
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={[styles.remainingAmount, { color: theme.colors.success }]}
                    >
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
                  {currentBudget?.percentage?.toFixed?.(1) ?? 0}% used
                </Text>

                <Button
                  mode="outlined"
                  onPress={() => setShowSetBudgetModal(true)}
                  style={styles.editButton}
                >
                  Edit Budget
                </Button>
              </Card.Content>
            </Card>

            {weeklyStats?.length > 0 && (
              <Card style={styles.chartCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.chartTitle}>
                    Weekly Spending
                  </Text>
                  <BarChart
                    data={getChartData()}
                    width={screenWidth - 64}
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: theme.colors.surface,
                      backgroundGradientFrom: theme.colors.surface,
                      backgroundGradientTo: theme.colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => theme.colors.primary,
                      labelColor: (opacity = 1) => theme.colors.onSurface,
                      style: {
                        borderRadius: 8,
                      },
                      propsForLabels: {
                        fontSize: 10,
                      },
                    }}
                    style={styles.chart}
                    fromZero
                  />
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <SetBudgetModal
        visible={showSetBudgetModal}
        budget={currentBudget?.budget ?? undefined}
        onDismiss={() => setShowSetBudgetModal(false)}
        onSuccess={() => {
          setShowSetBudgetModal(false);
          refresh();
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  budgetCard: {
    marginBottom: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    fontWeight: 'bold',
  },
  dateRange: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  amountBox: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  budgetAmount: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  spentAmount: {
    fontWeight: 'bold',
  },
  remainingAmount: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  editButton: {
    marginTop: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    marginBottom: spacing.md,
    color: theme.colors.onSurface,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 8,
  },
});

export default BudgetScreen;
