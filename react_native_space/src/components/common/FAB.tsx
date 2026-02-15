import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import { theme } from '../../config/theme';

interface FABProps {
  icon: string;
  label?: string;
  onPress: () => void;
  visible?: boolean;
}

export const FAB: React.FC<FABProps> = ({ icon, label, onPress, visible = true }) => {
  if (!visible) return null;

  return (
    <PaperFAB
      icon={icon}
      label={label}
      style={styles.fab}
      onPress={onPress}
      color={theme.colors.onPrimary}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});
