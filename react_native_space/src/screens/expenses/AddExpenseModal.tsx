import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  IconButton,
  Menu,
  Divider,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme, spacing } from '../../config/theme';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { uploadService, Expense } from '../../services/api';
import { validateExpense } from '../../utils/validationUtils';
import { formatDate } from '../../utils/dateUtils';
import { useSnackbar } from '../../components/common/Snackbar';
import { Loader } from '../../components/common/Loader';

interface AddExpenseModalProps {
  visible: boolean;
  expense?: Expense | null;
  onDismiss: () => void;
  onSuccess: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  expense,
  onDismiss,
  onSuccess,
}) => {
  const { createExpense, updateExpense } = useExpenses();
  const { categories } = useCategories();
  const { showSnackbar } = useSnackbar();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    if (visible && expense) {
      setAmount(expense?.amount?.toString() ?? '');
      setCategoryId(expense?.categoryId ?? '');
      setDate(expense?.date ? new Date(expense.date) : new Date());
      setDescription(expense?.description ?? '');
      setReceiptUrl(expense?.receiptUrl ?? null);
    } else if (visible) {
      resetForm();
    }
  }, [visible, expense]);

  const resetForm = () => {
    setAmount('');
    setCategoryId('');
    setDate(new Date());
    setDescription('');
    setReceiptUri(null);
    setReceiptUrl(null);
    setErrors({});
  };

  const handleSave = async () => {
    const validation = validateExpense({
      amount: parseFloat(amount),
      categoryId,
      date: date.toISOString(),
      description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    let finalReceiptUrl = receiptUrl;

    try {
      if (receiptUri && !receiptUrl) {
        setUploadingReceipt(true);
        finalReceiptUrl = await uploadService.uploadReceipt(receiptUri);
        setUploadingReceipt(false);
      }

      const expenseData = {
        amount: parseFloat(amount),
        categoryId,
        date: date.toISOString().split('T')[0],
        description,
        receiptUrl: finalReceiptUrl,
      };

      let result;
      if (expense?.id) {
        result = await updateExpense(expense.id, expenseData);
      } else {
        result = await createExpense(expenseData);
      }

      if (result?.success) {
        onSuccess();
      }
    } catch (error: any) {
      showSnackbar(
        error?.response?.data?.message || 'Failed to save expense',
        'error'
      );
    } finally {
      setLoading(false);
      setUploadingReceipt(false);
    }
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showSnackbar('Camera permission is required', 'error');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showSnackbar('Gallery permission is required', 'error');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
        });
      }

      if (!result?.canceled && result?.assets?.[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
        setReceiptUrl(null);
      }
    } catch (error) {
      showSnackbar('Failed to pick image', 'error');
    }
  };

  const selectedCategory = categories?.find?.(c => c?.id === categoryId);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text variant="headlineSmall">
                {expense ? 'Edit Expense' : 'Add Expense'}
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

            <Menu
              visible={showCategoryMenu}
              onDismiss={() => setShowCategoryMenu(false)}
              anchor={
                <Pressable onPress={() => setShowCategoryMenu(true)}>
                  <TextInput
                    label="Category *"
                    value={selectedCategory?.name ?? ''}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors?.categoryId}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    left={
                      selectedCategory ? (
                        <TextInput.Icon
                          icon={(selectedCategory?.icon as any) ?? 'shape'}
                          color={selectedCategory?.color}
                        />
                      ) : (
                        <TextInput.Icon icon="shape" />
                      )
                    }
                  />
                </Pressable>
              }
            >
              {categories?.map?.(category => (
                <React.Fragment key={category?.id}>
                  <Menu.Item
                    onPress={() => {
                      setCategoryId(category?.id ?? '');
                      setShowCategoryMenu(false);
                      setErrors(prev => ({ ...prev, categoryId: '' }));
                    }}
                    title={category?.name ?? ''}
                    leadingIcon={(category?.icon as any) ?? 'shape'}
                  />
                  <Divider />
                </React.Fragment>
              )) ?? []}
            </Menu>
            {errors?.categoryId ? (
              <HelperText type="error">{errors.categoryId}</HelperText>
            ) : null}

            <Pressable onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Date *"
                value={formatDate(date.toISOString(), 'MMM dd, yyyy')}
                mode="outlined"
                style={styles.input}
                error={!!errors?.date}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate);
                    setErrors(prev => ({ ...prev, date: '' }));
                  }
                }}
              />
            )}

            <TextInput
              label="Description *"
              value={description}
              onChangeText={text => {
                setDescription(text);
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              mode="outlined"
              style={styles.input}
              error={!!errors?.description}
              multiline
              numberOfLines={3}
            />
            {errors?.description ? (
              <HelperText type="error">{errors.description}</HelperText>
            ) : null}

            <Text variant="titleSmall" style={styles.receiptLabel}>
              Receipt (Optional)
            </Text>
            <View style={styles.receiptActions}>
              <Button
                mode="outlined"
                icon="camera"
                onPress={() => handlePickImage(true)}
                style={styles.receiptButton}
                disabled={uploadingReceipt}
              >
                Camera
              </Button>
              <Button
                mode="outlined"
                icon="image"
                onPress={() => handlePickImage(false)}
                style={styles.receiptButton}
                disabled={uploadingReceipt}
              >
                Gallery
              </Button>
            </View>

            {(receiptUri || receiptUrl) && (
              <View style={styles.receiptPreview}>
                <Image
                  source={{ uri: receiptUri ?? receiptUrl ?? undefined }}
                  style={styles.receiptImage}
                />
                <IconButton
                  icon="close-circle"
                  size={24}
                  style={styles.removeReceipt}
                  onPress={() => {
                    setReceiptUri(null);
                    setReceiptUrl(null);
                  }}
                />
              </View>
            )}

            <View style={styles.actions}>
              <Button mode="outlined" onPress={onDismiss} style={styles.button}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
                disabled={loading || uploadingReceipt}
              >
                {expense ? 'Update' : 'Save'}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Loader visible={loading || uploadingReceipt} text="Saving..." />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: spacing.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },
  keyboardView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: spacing.lg,
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
  receiptLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  receiptButton: {
    flex: 1,
  },
  receiptPreview: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeReceipt: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
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

export default AddExpenseModal;
