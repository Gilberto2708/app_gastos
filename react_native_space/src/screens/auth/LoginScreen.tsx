import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../config/theme';
import { Loader } from '../../components/common/Loader';

const LoginScreen = () => {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!pin || pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    const result = await login(pin);
    setLoading(false);

    if (!result?.success) {
      setError(result?.error || 'Login failed');
    }
  };

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);
      setError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              💰
            </Text>
            <Text variant="headlineLarge" style={styles.appName}>
              Expense Tracker
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Track your shared expenses easily
            </Text>
          </View>

          <View style={styles.form}>
            <Text variant="titleMedium" style={styles.label}>
              Enter your PIN
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter 4-6 digit PIN"
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              error={!!error}
              style={styles.input}
              autoFocus
              accessibilityLabel="PIN input"
              accessibilityHint="Enter your 4 to 6 digit PIN"
            />
            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={loading || pin?.length < 4}
              style={styles.button}
              contentStyle={styles.buttonContent}
              accessibilityLabel="Login button"
              accessibilityHint="Tap to login with your PIN"
            >
              Login
            </Button>

            <View style={styles.hint}>
              <Text variant="bodySmall" style={styles.hintText}>
                Default PIN: 0000
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Loader visible={loading} text="Logging in..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  appName: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.md,
    color: theme.colors.onSurface,
  },
  input: {
    marginBottom: spacing.sm,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonContent: {
    height: 56,
  },
  hint: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 8,
    alignItems: 'center',
  },
  hintText: {
    color: theme.colors.onSurface,
  },
});

export default LoginScreen;
