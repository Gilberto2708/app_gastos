import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Portal, Text } from 'react-native-paper';
import { theme } from '../../config/theme';

interface LoaderProps {
  visible: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <Portal>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.container}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {text && <Text style={styles.text}>{text}</Text>}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  text: {
    marginTop: 16,
    color: theme.colors.onSurface,
  },
});
