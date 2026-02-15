import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    create(createBudgetDto: CreateBudgetDto): Promise<{
        budget: {
            id: any;
            amount: number;
            type: any;
            startDate: any;
            endDate: any;
        };
    }>;
    findAll(): Promise<{
        budgets: {
            id: any;
            amount: number;
            type: any;
            startDate: any;
            endDate: any;
        }[];
    }>;
    getCurrentBudget(): Promise<{
        budget: {
            id: any;
            amount: number;
            type: any;
            startDate: any;
            endDate: any;
        };
        spent: number;
        remaining: number;
        percentage: number;
    }>;
    update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<{
        budget: {
            id: any;
            amount: number;
            type: any;
            startDate: any;
            endDate: any;
        };
    }>;
}
