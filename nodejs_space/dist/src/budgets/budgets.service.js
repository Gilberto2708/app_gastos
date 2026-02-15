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
var BudgetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BudgetsService = BudgetsService_1 = class BudgetsService {
    prisma;
    logger = new common_1.Logger(BudgetsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBudgetDto) {
        try {
            const budget = await this.prisma.budgets.create({
                data: {
                    amount: new client_1.Prisma.Decimal(createBudgetDto.amount),
                    type: createBudgetDto.type,
                    startdate: new Date(createBudgetDto.startDate),
                    enddate: new Date(createBudgetDto.endDate),
                },
            });
            this.logger.log(`Budget created: ${budget.id}`);
            return { budget: this.formatBudget(budget) };
        }
        catch (error) {
            this.logger.error('Failed to create budget', error);
            throw error;
        }
    }
    async findAll() {
        try {
            const budgets = await this.prisma.budgets.findMany({
                orderBy: { startdate: 'desc' },
            });
            return { budgets: budgets.map(b => this.formatBudget(b)) };
        }
        catch (error) {
            this.logger.error('Failed to fetch budgets', error);
            throw error;
        }
    }
    async update(id, updateBudgetDto) {
        try {
            const data = {};
            if (updateBudgetDto.amount !== undefined) {
                data.amount = new client_1.Prisma.Decimal(updateBudgetDto.amount);
            }
            if (updateBudgetDto.type !== undefined) {
                data.type = updateBudgetDto.type;
            }
            const budget = await this.prisma.budgets.update({
                where: { id },
                data,
            });
            this.logger.log(`Budget updated: ${id}`);
            return { budget: this.formatBudget(budget) };
        }
        catch (error) {
            this.logger.error(`Failed to update budget: ${id}`, error);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Budget not found');
            }
            throw error;
        }
    }
    async getCurrentBudget() {
        try {
            const now = new Date();
            const budget = await this.prisma.budgets.findFirst({
                where: {
                    startdate: { lte: now },
                    enddate: { gte: now },
                },
                orderBy: { startdate: 'desc' },
            });
            if (!budget) {
                throw new common_1.NotFoundException('No active budget found');
            }
            const expenses = await this.prisma.expenses.findMany({
                where: {
                    date: {
                        gte: budget.startdate,
                        lte: budget.enddate,
                    },
                },
            });
            const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            const budgetAmount = Number(budget.amount);
            const remaining = budgetAmount - spent;
            const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
            return {
                budget: this.formatBudget(budget),
                spent: Number(spent.toFixed(2)),
                remaining: Number(remaining.toFixed(2)),
                percentage,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch current budget', error);
            throw error;
        }
    }
    formatBudget(budget) {
        return {
            id: budget.id,
            amount: Number(budget.amount),
            type: budget.type,
            startDate: budget.startdate,
            endDate: budget.enddate,
        };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = BudgetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map