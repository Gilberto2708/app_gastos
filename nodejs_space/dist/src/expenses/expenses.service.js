"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExpensesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ExpensesService = ExpensesService_1 = class ExpensesService {
    prisma;
    logger = new common_1.Logger(ExpensesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto) {
        try {
            const expense = await this.prisma.expenses.create({
                data: {
                    amount: new client_1.Prisma.Decimal(createExpenseDto.amount),
                    categoryid: createExpenseDto.categoryId,
                    date: new Date(createExpenseDto.date),
                    description: createExpenseDto.description,
                    receipturl: createExpenseDto.receiptUrl || null,
                },
                include: {
                    category: true,
                },
            });
            this.logger.log(`Expense created: ${expense.id}`);
            return { expense: this.formatExpense(expense) };
        }
        catch (error) {
            this.logger.error('Failed to create expense', error);
            throw error;
        }
    }
    async findAll(query) {
        try {
            const where = {};
            if (query.categoryId) {
                where.categoryid = query.categoryId;
            }
            if (query.startDate || query.endDate) {
                where.date = {};
                if (query.startDate) {
                    where.date.gte = new Date(query.startDate);
                }
                if (query.endDate) {
                    where.date.lte = new Date(query.endDate);
                }
            }
            const expenses = await this.prisma.expenses.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: { date: 'desc' },
            });
            const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            return {
                expenses: expenses.map(exp => this.formatExpense(exp)),
                total: Number(total.toFixed(2)),
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch expenses', error);
            throw error;
        }
    }
    async update(id, updateExpenseDto) {
        try {
            const data = {};
            if (updateExpenseDto.amount !== undefined) {
                data.amount = new client_1.Prisma.Decimal(updateExpenseDto.amount);
            }
            if (updateExpenseDto.categoryId !== undefined) {
                data.categoryid = updateExpenseDto.categoryId;
            }
            if (updateExpenseDto.date !== undefined) {
                data.date = new Date(updateExpenseDto.date);
            }
            if (updateExpenseDto.description !== undefined) {
                data.description = updateExpenseDto.description;
            }
            if (updateExpenseDto.receiptUrl !== undefined) {
                data.receipturl = updateExpenseDto.receiptUrl;
            }
            const expense = await this.prisma.expenses.update({
                where: { id },
                data,
                include: {
                    category: true,
                },
            });
            this.logger.log(`Expense updated: ${id}`);
            return { expense: this.formatExpense(expense) };
        }
        catch (error) {
            this.logger.error(`Failed to update expense: ${id}`, error);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Expense not found');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.prisma.expenses.delete({
                where: { id },
            });
            this.logger.log(`Expense deleted: ${id}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete expense: ${id}`, error);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Expense not found');
            }
            throw error;
        }
    }
    formatExpense(expense) {
        return {
            id: expense.id,
            amount: Number(expense.amount),
            categoryId: expense.categoryid,
            category: expense.category,
            date: expense.date,
            description: expense.description,
            receiptUrl: expense.receipturl,
            createdAt: expense.createdat,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = ExpensesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map