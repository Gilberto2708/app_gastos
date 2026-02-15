import {
  formatDate,
  formatCurrency,
  getDateRangePreset,
  getCurrentWeekRange,
  formatDateRange,
} from '../dateUtils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2026-02-15';
      const result = formatDate(date);
      expect(result).toBe('Feb 15, 2026');
    });

    it('should handle custom format', () => {
      const date = '2026-02-15';
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2026-02-15');
    });

    it('should handle invalid date gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(123.456);
      expect(result).toBe('$123.46');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-50.25);
      expect(result).toBe('$-50.25');
    });
  });

  describe('getDateRangePreset', () => {
    it('should return this week range', () => {
      const result = getDateRangePreset('thisWeek');
      expect(result).toBeTruthy();
      expect(result?.startDate).toBeTruthy();
      expect(result?.endDate).toBeTruthy();
    });

    it('should return this month range', () => {
      const result = getDateRangePreset('thisMonth');
      expect(result).toBeTruthy();
      expect(result?.startDate).toBeTruthy();
      expect(result?.endDate).toBeTruthy();
    });

    it('should return null for custom', () => {
      const result = getDateRangePreset('custom');
      expect(result).toBeNull();
    });
  });

  describe('getCurrentWeekRange', () => {
    it('should return current week range', () => {
      const result = getCurrentWeekRange();
      expect(result.start).toBeTruthy();
      expect(result.end).toBeTruthy();
    });
  });

  describe('formatDateRange', () => {
    it('should format date range correctly', () => {
      const result = formatDateRange('2026-02-01', '2026-02-28');
      expect(result).toContain('Feb 01');
      expect(result).toContain('Feb 28, 2026');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDateRange('invalid', 'dates');
      expect(result).toBe('');
    });
  });
});
