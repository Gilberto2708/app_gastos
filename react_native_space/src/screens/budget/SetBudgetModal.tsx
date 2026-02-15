import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  IconButton,
  HelperText,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme, spacing } from '../../config/theme';
import { useBudget } from '../../hooks/useBudget';
import { Budget } from '../../services/api';
import { validateBudget } from '../../utils/validationUtils';
import { formatDate } from '../../utils/dateUtils';
import { Loader } from '../../components/common/Loader';
import { addDays, addMonths } from 'date-fns';

interface SetBudgetModalProps {
  visible: boolean;
  budget?: Budget;
  onDismiss: () => void;
  onSuccess: () => void;
}

const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  visible,
  budget,
  onDismiss,
  onSuccess,
}) => {
  const { createBudget, updateBudget } = useBudget();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartPicker, setShowStartPicker] = useState(false);

  useEffect(() => {
    if (visible && budget) {
      setAmount(budget?.amount?.toString() ?? '');
      setType(budget?.type ?? 'WEEKLY');
      setStartDate(budget?.startDate ? new Date(budget.startDate) : new Date());
      setEndDate(budget?.endDate ? new Date(budget.endDate) : new Date());
    } else if (visible) {
      resetForm();
    }
  }, [visible, budget]);

  const resetForm = () => {
    setAmount('');
    setType('WEEKLY');
    const now = new Date();
    setStartDate(now);
    setEndDate(addDays(now, 7));
    setErrors({});
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'WEEKLY' | 'MONTHLY';
    setType(newType);
    
    const end = newType === 'WEEKLY' ? addDays(startDate, 7) : addMonths(startDate, 1);
    setEndDate(end);
  };

  const handleStartDateChange = (selectedDate: Date) => {
    setStartDate(selectedDate);
    const end = type === 'WEEKLY' ? addDays(selectedDate, 7) : addMonths(selectedDate, 1);
    setEndDate(end);
  };

  const handleSave = async () => {
    const validation = validateBudget({
      amount: parseFloat(amount),
      type,
      startDate: startDate.toISOString(),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    const budgetData = {
      amount: parseFloat(amount),
      type,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    let result;
    if (budget?.id) {
      result = await updateBudget(budget.id, budgetData);
    } else {
      result = await createBudget(budgetData);
    }

    setLoading(false);
    if (result?.success) {
      onSuccess();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall">
            {budget ? 'Edit Budget' : 'Set Budget'}
          </Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <TextInput
          label="Amount *"
          value={amount}
          onChangeText={text => {
            setAmount(text.replace(/[^0-9.]/g, ''));
            setErrors(prev => ({ ...prev, amount: '' }));
          }}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
          error={!!errors?.amount}
          left={<TextInput.Icon icon="currency-usd" />}
        />
        {errors?.amount ? (
          <HelperText type="error">{errors.amount}</HelperText>
        ) : null}

        <Text variant="titleSmall" style={styles.label}>
          Budget Type *
        </Text>
        <SegmentedButtons
          value={type}
          onValueChange={handleTypeChange}
          buttons={[
            { value: 'WEEKLY', label: 'Weekly' },
            { value: 'MONTHLY', label: 'Monthly' },
          ]}
          style={styles.segmented}
        />

        <Pressable onPress={() => setShowStartPicker(true)}>
          <TextInput
            label="Start Date *"
            value={formatDate(startDate.toISOString(), 'MMM dd, yyyy')}
            mode="outlined"
            style={styles.input}
            error={!!errors?.startDate}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) {
                handleStartDateChange(selectedDate);
                setErrors(prev => ({ ...prev, startDate: '' }));
              }
            }}
          />
        )}

        <TextInput
          label="End Date"
          value={formatDate(endDate.toISOString(), 'MMM dd, yyyy')}
          mode="outlined"
          style={styles.input}
          editable={false}
          disabled
        />

        <Text variant="bodySmall" style={styles.hint}>
          End date is automatically calculated based on the budget type
        </Text>

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={loading}
          >
            {budget ? 'Update' : 'Save'}
          </Button>
        </View>

        <Loader visible={loading} text="Saving..." />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  segmented: {
    marginBottom: spacing.lg,
  },
  hint: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
  },
});

export default SetBudgetModal;
