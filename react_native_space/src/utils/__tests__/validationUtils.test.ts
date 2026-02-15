import {
  validateExpense,
  validateCategory,
  validateBudget,
} from '../validationUtils';

describe('Validation Utils', () => {
  describe('validateExpense', () => {
    it('should validate a valid expense', () => {
      const expense = {
        amount: 100,
        categoryId: 'cat-1',
        date: '2026-02-15',
        description: 'Lunch',
      };

      const result = validateExpense(expense);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should fail validation for invalid amount', () => {
      const expense = {
        amount: 0,
        categoryId: 'cat-1',
        date: '2026-02-15',
        description: 'Lunch',
      };

      const result = validateExpense(expense);

      expect(result.isValid).toBe(false);
      expect(result.errors?.amount).toBeTruthy();
    });

    it('should fail validation for missing category', () => {
      const expense = {
        amount: 100,
        categoryId: '',
        date: '2026-02-15',
        description: 'Lunch',
      };

      const result = validateExpense(expense);

      expect(result.isValid).toBe(false);
      expect(result.errors?.categoryId).toBeTruthy();
    });

    it('should fail validation for empty description', () => {
      const expense = {
        amount: 100,
        categoryId: 'cat-1',
        date: '2026-02-15',
        description: '',
      };

      const result = validateExpense(expense);

      expect(result.isValid).toBe(false);
      expect(result.errors?.description).toBeTruthy();
    });
  });

  describe('validateCategory', () => {
    it('should validate a valid category', () => {
      const category = {
        name: 'Food',
        color: '#FF5733',
        icon: 'food',
      };

      const result = validateCategory(category);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should fail validation for empty name', () => {
      const category = {
        name: '',
        color: '#FF5733',
        icon: 'food',
      };

      const result = validateCategory(category);

      expect(result.isValid).toBe(false);
      expect(result.errors?.name).toBeTruthy();
    });

    it('should fail validation for missing color', () => {
      const category = {
        name: 'Food',
        color: '',
        icon: 'food',
      };

      const result = validateCategory(category);

      expect(result.isValid).toBe(false);
      expect(result.errors?.color).toBeTruthy();
    });
  });

  describe('validateBudget', () => {
    it('should validate a valid budget', () => {
      const budget = {
        amount: 1000,
        type: 'WEEKLY',
        startDate: '2026-02-15',
      };

      const result = validateBudget(budget);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should fail validation for invalid amount', () => {
      const budget = {
        amount: 0,
        type: 'WEEKLY',
        startDate: '2026-02-15',
      };

      const result = validateBudget(budget);

      expect(result.isValid).toBe(false);
      expect(result.errors?.amount).toBeTruthy();
    });

    it('should fail validation for missing type', () => {
      const budget = {
        amount: 1000,
        type: '',
        startDate: '2026-02-15',
      };

      const result = validateBudget(budget);

      expect(result.isValid).toBe(false);
      expect(result.errors?.type).toBeTruthy();
    });
  });
});
