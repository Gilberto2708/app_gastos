import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import ENV from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
};

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token && config?.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid - handled by AuthContext
    }
    return Promise.reject(error);
  }
);

// Types
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category?: Category;
  date: string;
  description: string;
  receiptUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  amount: number;
  type: 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetStatus {
  budget: Budget | null;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface StatsResponse {
  total: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    count: number;
  }>;
  byDay?: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

// Auth Service
export const authService = {
  login: async (pin: string): Promise<{ token: string; success: boolean }> => {
    const response = await apiClient.post('/auth/login', { pin });
    return response?.data ?? { success: false };
  },
};

// Category Service
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response?.data?.categories ?? [];
  },

  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await apiClient.post('/categories', data);
    return response?.data ?? {};
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response?.data ?? {};
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

// Expense Service
export const expenseService = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }): Promise<{ expenses: Expense[]; total: number }> => {
    const response = await apiClient.get('/expenses', { params });
    return { 
      expenses: response?.data?.expenses ?? [], 
      total: response?.data?.total ?? 0 
    };
  },

  getById: async (id: string): Promise<Expense | null> => {
    const response = await apiClient.get(`/expenses/${id}`);
    return response?.data ?? null;
  },

  create: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await apiClient.post('/expenses', data);
    return response?.data ?? {};
  },

  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.put(`/expenses/${id}`, data);
    return response?.data ?? {};
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },
};

// Budget Service
export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await apiClient.get('/budgets');
    return response?.data?.budgets ?? [];
  },

  getCurrent: async (): Promise<BudgetStatus> => {
    const response = await apiClient.get('/budgets/current');
    return response?.data ?? { budget: null, spent: 0, remaining: 0, percentage: 0 };
  },

  create: async (data: Omit<Budget, 'id'>): Promise<Budget> => {
    const response = await apiClient.post('/budgets', data);
    return response?.data ?? {};
  },

  update: async (id: string, data: Partial<Budget>): Promise<Budget> => {
    const response = await apiClient.put(`/budgets/${id}`, data);
    return response?.data ?? {};
  },
};

// Stats Service
export const statsService = {
  getWeekly: async (startDate?: string): Promise<StatsResponse> => {
    const response = await apiClient.get('/stats/weekly', {
      params: startDate ? { startDate } : undefined,
    });
    return response?.data ?? { total: 0, byCategory: [], byDay: [] };
  },

  getByCategory: async (startDate?: string, endDate?: string): Promise<StatsResponse> => {
    const response = await apiClient.get('/stats/by-category', {
      params: { startDate, endDate },
    });
    return response?.data ?? { total: 0, byCategory: [] };
  },
};

// Upload Service
export const uploadService = {
  uploadReceipt: async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() ?? 'receipt.jpg';
    const match = /\.([\w]+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post('/upload/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data?.url ?? '';
  },
};

export default apiClient;
