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
var StatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = StatsService_1 = class StatsService {
    prisma;
    logger = new common_1.Logger(StatsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWeeklyStats(query) {
        try {
            const startDate = query.startDate ? new Date(query.startDate) : new Date();
            const endDate = query.endDate
                ? new Date(query.endDate)
                : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const expenses = await this.prisma.expenses.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                include: {
                    category: true,
                },
            });
            const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            const categoryMap = new Map();
            expenses.forEach(expense => {
                const categoryId = expense.categoryid;
                const categoryName = expense.category.name;
                const current = categoryMap.get(categoryId) || { name: categoryName, total: 0 };
                current.total += Number(expense.amount);
                categoryMap.set(categoryId, current);
            });
            const byCategory = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
                categoryId,
                categoryName: data.name,
                total: Number(data.total.toFixed(2)),
                percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
            }));
            const dayMap = new Map();
            expenses.forEach(expense => {
                const dateStr = expense.date.toISOString().split('T')[0];
                const current = dayMap.get(dateStr) || 0;
                dayMap.set(dateStr, current + Number(expense.amount));
            });
            const byDay = Array.from(dayMap.entries())
                .map(([date, total]) => ({
                date,
                total: Number(total.toFixed(2)),
            }))
                .sort((a, b) => a.date.localeCompare(b.date));
            return {
                total: Number(total.toFixed(2)),
                byCategory,
                byDay,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch weekly stats', error);
            throw error;
        }
    }
    async getStatsByCategory(query) {
        try {
            const where = {};
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
            });
            const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            const categoryMap = new Map();
            expenses.forEach(expense => {
                const categoryId = expense.categoryid;
                const current = categoryMap.get(categoryId) || {
                    name: expense.category.name,
                    color: expense.category.color,
                    total: 0,
                };
                current.total += Number(expense.amount);
                categoryMap.set(categoryId, current);
            });
            const categories = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
                categoryId,
                name: data.name,
                color: data.color,
                total: Number(data.total.toFixed(2)),
                percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
            }));
            return { categories };
        }
        catch (error) {
            this.logger.error('Failed to fetch stats by category', error);
            throw error;
        }
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = StatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map