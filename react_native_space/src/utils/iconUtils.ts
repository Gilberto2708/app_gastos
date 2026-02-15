export const CATEGORY_ICONS = [
  'food',
  'food-fork-drink',
  'hamburger',
  'coffee',
  'car',
  'bus',
  'train',
  'airplane',
  'movie',
  'music',
  'gamepad-variant',
  'controller-classic',
  'file-document',
  'receipt',
  'cash',
  'credit-card',
  'cart',
  'shopping',
  'home',
  'lightbulb',
  'water',
  'heart',
  'hospital-box',
  'pill',
  'dumbbell',
  'book',
  'school',
  'briefcase',
  'account-group',
  'gift',
];

export const CATEGORY_COLORS = [
  '#F44336', // Red
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
];

export const getIconForCategory = (categoryName: string): string => {
  const name = categoryName?.toLowerCase() ?? '';
  
  if (name.includes('food') || name.includes('restaurant')) return 'food';
  if (name.includes('transport') || name.includes('car')) return 'car';
  if (name.includes('entertainment') || name.includes('movie')) return 'movie';
  if (name.includes('bill') || name.includes('utility')) return 'receipt';
  if (name.includes('shopping') || name.includes('shop')) return 'cart';
  if (name.includes('health') || name.includes('medical')) return 'hospital-box';
  if (name.includes('home') || name.includes('rent')) return 'home';
  
  return 'cash';
};
