import { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainApp: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Categories: undefined;
  Budget: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  AddExpense: { expenseId?: string; isEdit?: boolean };
  ExpenseDetail: { expenseId: string };
};

export type ExpenseStackParamList = {
  ExpenseList: undefined;
  AddExpense: { expenseId?: string; isEdit?: boolean };
  ExpenseDetail: { expenseId: string };
};

export type CategoryStackParamList = {
  CategoryList: undefined;
  AddCategory: { categoryId?: string; isEdit?: boolean };
};

export type BudgetStackParamList = {
  BudgetMain: undefined;
  SetBudget: { budgetId?: string; isEdit?: boolean };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

export type ExpenseStackScreenProps<T extends keyof ExpenseStackParamList> =
  NativeStackScreenProps<ExpenseStackParamList, T>;

export type CategoryStackScreenProps<T extends keyof CategoryStackParamList> =
  NativeStackScreenProps<CategoryStackParamList, T>;

export type BudgetStackScreenProps<T extends keyof BudgetStackParamList> =
  NativeStackScreenProps<BudgetStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
