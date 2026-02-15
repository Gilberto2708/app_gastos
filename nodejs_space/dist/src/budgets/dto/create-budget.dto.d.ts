import { BudgetType } from '@prisma/client';
export declare class CreateBudgetDto {
    amount: number;
    type: BudgetType;
    startDate: string;
    endDate: string;
}
