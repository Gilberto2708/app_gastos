import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Snackbar as PaperSnackbar } from 'react-native-paper';
import { theme } from '../../config/theme';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = useCallback(
    (msg: string, snackType: SnackbarType = 'info', dur: number = 3000) => {
      setMessage(msg);
      setType(snackType);
      setDuration(dur);
      setVisible(true);
    },
    []
  );

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <PaperSnackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        action={{
          label: 'Dismiss',
          onPress: hideSnackbar,
        }}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {message}
      </PaperSnackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};
