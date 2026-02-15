import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  IconButton,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, spacing } from '../../config/theme';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../services/api';
import { validateCategory } from '../../utils/validationUtils';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../../utils/iconUtils';
import { Loader } from '../../components/common/Loader';

interface AddCategoryModalProps {
  visible: boolean;
  category?: Category | null;
  onDismiss: () => void;
  onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  category,
  onDismiss,
  onSuccess,
}) => {
  const { createCategory, updateCategory } = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && category) {
      setName(category?.name ?? '');
      setColor(category?.color ?? '');
      setIcon(category?.icon ?? '');
    } else if (visible) {
      resetForm();
    }
  }, [visible, category]);

  const resetForm = () => {
    setName('');
    setColor(CATEGORY_COLORS[0]);
    setIcon(CATEGORY_ICONS[0]);
    setErrors({});
  };

  const handleSave = async () => {
    const validation = validateCategory({ name, color, icon });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    let result;
    if (category?.id) {
      result = await updateCategory(category.id, { name, color, icon });
    } else {
      result = await createCategory({ name, color, icon });
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineSmall">
              {category ? 'Edit Category' : 'Add Category'}
            </Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>

          <TextInput
            label="Name *"
            value={name}
            onChangeText={text => {
              setName(text);
              setErrors(prev => ({ ...prev, name: '' }));
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors?.name}
          />
          {errors?.name ? (
            <HelperText type="error">{errors.name}</HelperText>
          ) : null}

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Color *
          </Text>
          <View style={styles.colorGrid}>
            {CATEGORY_COLORS.map(c => (
              <Pressable
                key={c}
                onPress={() => {
                  setColor(c);
                  setErrors(prev => ({ ...prev, color: '' }));
                }}
                style={[
                  styles.colorItem,
                  { backgroundColor: c },
                  color === c && styles.selectedColor,
                ]}
                accessibilityLabel={`Color ${c}`}
              >
                {color === c && (
                  <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                )}
              </Pressable>
            ))}
          </View>
          {errors?.color ? (
            <HelperText type="error">{errors.color}</HelperText>
          ) : null}

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Icon *
          </Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICONS.map(i => (
              <Pressable
                key={i}
                onPress={() => {
                  setIcon(i);
                  setErrors(prev => ({ ...prev, icon: '' }));
                }}
                style={[
                  styles.iconItem,
                  icon === i && styles.selectedIcon,
                ]}
                accessibilityLabel={`Icon ${i}`}
              >
                <MaterialCommunityIcons
                  name={i as any}
                  size={28}
                  color={icon === i ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
              </Pressable>
            ))}
          </View>
          {errors?.icon ? (
            <HelperText type="error">{errors.icon}</HelperText>
          ) : null}

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
              {category ? 'Update' : 'Save'}
            </Button>
          </View>
        </ScrollView>
        <Loader visible={loading} text="Saving..." />
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
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    color: theme.colors.onSurface,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: theme.colors.onSurface,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconItem: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primaryContainer,
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

export default AddCategoryModal;
