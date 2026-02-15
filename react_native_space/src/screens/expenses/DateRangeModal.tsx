import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  SegmentedButtons,
  TextInput,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme, spacing } from '../../config/theme';
import { getDateRangePreset, formatDate } from '../../utils/dateUtils';

interface DateRangeModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible,
  onDismiss,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const [preset, setPreset] = useState<string>('thisMonth');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialStartDate && initialEndDate) {
        setStartDate(new Date(initialStartDate));
        setEndDate(new Date(initialEndDate));
        setPreset('custom');
      } else {
        const range = getDateRangePreset('thisMonth');
        if (range) {
          setStartDate(new Date(range.startDate));
          setEndDate(new Date(range.endDate));
        }
      }
    }
  }, [visible, initialStartDate, initialEndDate]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      const range = getDateRangePreset(value as any);
      if (range) {
        setStartDate(new Date(range.startDate));
        setEndDate(new Date(range.endDate));
      }
    }
  };

  const handleApply = () => {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    onApply(start, end);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall">Select Date Range</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <SegmentedButtons
          value={preset}
          onValueChange={handlePresetChange}
          buttons={[
            { value: 'thisWeek', label: 'This Week' },
            { value: 'thisMonth', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' },
            { value: 'custom', label: 'Custom' },
          ]}
          style={styles.segmented}
        />

        <Pressable onPress={() => setShowStartPicker(true)}>
          <TextInput
            label="Start Date"
            value={formatDate(startDate.toISOString(), 'MMM dd, yyyy')}
            mode="outlined"
            style={styles.input}
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
                setStartDate(selectedDate);
                setPreset('custom');
              }
            }}
          />
        )}

        <Pressable onPress={() => setShowEndPicker(true)}>
          <TextInput
            label="End Date"
            value={formatDate(endDate.toISOString(), 'MMM dd, yyyy')}
            mode="outlined"
            style={styles.input}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) {
                setEndDate(selectedDate);
                setPreset('custom');
              }
            }}
          />
        )}

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleApply} style={styles.button}>
            Apply
          </Button>
        </View>
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
  segmented: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default DateRangeModal;
