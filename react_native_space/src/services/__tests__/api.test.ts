import { authService, categoryService, expenseService } from '../api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authService', () => {
    it('should login successfully with valid PIN', async () => {
      const mockResponse = {
        data: { token: 'test-token', success: true },
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authService.login('0000');

      expect(result?.token).toBe('test-token');
      expect(result?.success).toBe(true);
    });

    it('should handle login failure gracefully', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(authService.login('1234')).rejects.toThrow();
    });
  });

  describe('categoryService', () => {
    it('should fetch all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Food', color: '#FF5733', icon: 'food' },
        { id: '2', name: 'Transport', color: '#3357FF', icon: 'car' },
      ];
      const mockResponse = {
        data: { categories: mockCategories },
      };
      mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await categoryService.getAll();

      expect(result).toEqual(mockCategories);
      expect(result?.length).toBe(2);
    });

    it('should create a category', async () => {
      const newCategory = { name: 'Shopping', color: '#FFAA00', icon: 'cart' };
      const mockResponse = {
        data: { id: '3', ...newCategory },
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await categoryService.create(newCategory);

      expect(result?.id).toBe('3');
      expect(result?.name).toBe('Shopping');
    });
  });

  describe('expenseService', () => {
    it('should fetch expenses with filters', async () => {
      const mockExpenses = [
        {
          id: '1',
          amount: 50.0,
          categoryId: '1',
          date: '2026-02-15',
          description: 'Lunch',
        },
      ];
      const mockResponse = {
        data: { expenses: mockExpenses, total: 50.0 },
      };
      mockedAxios.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await expenseService.getAll({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(result?.expenses).toEqual(mockExpenses);
      expect(result?.total).toBe(50.0);
    });

    it('should create an expense', async () => {
      const newExpense = {
        amount: 25.5,
        categoryId: '1',
        date: '2026-02-15',
        description: 'Coffee',
      };
      const mockResponse = {
        data: { id: '2', ...newExpense },
      };
      mockedAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await expenseService.create(newExpense);

      expect(result?.id).toBe('2');
      expect(result?.amount).toBe(25.5);
    });
  });
});
