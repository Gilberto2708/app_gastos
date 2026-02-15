import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { theme, spacing } from '../config/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        💰 Expense Tracker
      </Text>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loader}
      />
      <Text variant="bodyMedium" style={styles.subtitle}>
        Loading your expenses...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.xl,
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
  },
});

export default SplashScreen;
