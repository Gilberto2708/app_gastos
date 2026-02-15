import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto): Promise<{
        expense: {
            id: any;
            amount: number;
            categoryId: any;
            category: any;
            date: any;
            description: any;
            receiptUrl: any;
            createdAt: any;
        };
    }>;
    findAll(query: QueryExpensesDto): Promise<{
        expenses: {
            id: any;
            amount: number;
            categoryId: any;
            category: any;
            date: any;
            description: any;
            receiptUrl: any;
            createdAt: any;
        }[];
        total: number;
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<{
        expense: {
            id: any;
            amount: number;
            categoryId: any;
            category: any;
            date: any;
            description: any;
            receiptUrl: any;
            createdAt: any;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    private formatExpense;
}
