import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme, spacing } from '../../config/theme';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../services/api';
import AddCategoryModal from './AddCategoryModal';

const CategoriesScreen = () => {
  const { categories, loading, refreshing, refresh, deleteCategory } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (deletingCategory?.id) {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Pressable onPress={() => handleEdit(item)}>
      <Surface style={styles.categoryItem}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item?.color ?? theme.colors.primary },
          ]}
        >
          <MaterialCommunityIcons
            name={(item?.icon as any) ?? 'cash'}
            size={32}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text variant="titleMedium" style={styles.categoryName}>
            {item?.name ?? ''}
          </Text>
          <Text variant="bodySmall" style={styles.categoryColor}>
            {item?.color ?? ''}
          </Text>
        </View>
        <IconButton
          icon="delete"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => setDeletingCategory(item)}
          accessibilityLabel="Delete category"
        />
      </Surface>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Categories
        </Text>
      </View>

      <FlatList
        data={categories ?? []}
        renderItem={renderCategoryItem}
        keyExtractor={item => item?.id ?? ''}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        numColumns={1}
        ListEmptyComponent={
          <EmptyState
            icon="shape-outline"
            title="No categories"
            message="Create categories to organize your expenses"
            actionLabel="Add Category"
            onAction={() => setShowAddModal(true)}
          />
        }
      />

      <FAB icon="plus" onPress={() => setShowAddModal(true)} />

      <AddCategoryModal
        visible={showAddModal}
        category={editingCategory}
        onDismiss={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingCategory(null);
          refresh();
        }}
      />

      <ConfirmDialog
        visible={!!deletingCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name ?? ''}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
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
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  categoryColor: {
    color: theme.colors.onSurfaceVariant,
  },
});

export default CategoriesScreen;
