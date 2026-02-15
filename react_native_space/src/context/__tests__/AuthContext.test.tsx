import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../services/api');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current?.login).toBeDefined();
    expect(result.current?.logout).toBeDefined();
  });

  it('should login successfully', async () => {
    const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
    mockLogin.mockResolvedValue({ token: 'test-token', success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current?.login?.('0000');
    });

    await waitFor(() => {
      expect(loginResult?.success).toBe(true);
      expect(result.current?.isAuthenticated).toBe(true);
    });
  });

  it('should handle login failure', async () => {
    const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
    mockLogin.mockRejectedValue(new Error('Invalid PIN'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current?.login?.('1234');
    });

    expect(loginResult?.success).toBe(false);
    expect(result.current?.isAuthenticated).toBe(false);
  });

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current?.logout?.();
    });

    expect(result.current?.isAuthenticated).toBe(false);
    expect(result.current?.token).toBeNull();
  });
});
