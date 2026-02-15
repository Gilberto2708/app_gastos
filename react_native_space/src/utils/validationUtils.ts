export const validateExpense = (data: {
  amount?: number;
  categoryId?: string;
  date?: string;
  description?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data?.amount || data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data?.categoryId) {
    errors.categoryId = 'Please select a category';
  }

  if (!data?.date) {
    errors.date = 'Please select a date';
  }

  if (!data?.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCategory = (data: {
  name?: string;
  color?: string;
  icon?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data?.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  }

  if (!data?.color) {
    errors.color = 'Please select a color';
  }

  if (!data?.icon) {
    errors.icon = 'Please select an icon';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateBudget = (data: {
  amount?: number;
  type?: string;
  startDate?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data?.amount || data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data?.type) {
    errors.type = 'Please select budget type';
  }

  if (!data?.startDate) {
    errors.startDate = 'Please select start date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
