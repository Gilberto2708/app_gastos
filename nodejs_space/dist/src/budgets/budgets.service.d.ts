import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<{
        budget: {
            id: any;
            amount: number;
            type: any;
            startDate: any;
            endDate: any;
        };
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
    private formatBudget;
}
