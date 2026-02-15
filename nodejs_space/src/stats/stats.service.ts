import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStatsDto } from './dto/query-stats.dto';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyStats(query: QueryStatsDto) {
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

      const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      // Group by category
      const categoryMap = new Map<string, { name: string; total: number }>();
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

      // Group by day
      const dayMap = new Map<string, number>();
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
    } catch (error) {
      this.logger.error('Failed to fetch weekly stats', error);
      throw error;
    }
  }

  async getStatsByCategory(query: QueryStatsDto) {
    try {
      const where: any = {};

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

      const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      const categoryMap = new Map<
        string,
        { name: string; color: string; total: number }
      >();

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

      const categories = Array.from(categoryMap.entries()).map(
        ([categoryId, data]) => ({
          categoryId,
          name: data.name,
          color: data.color,
          total: Number(data.total.toFixed(2)),
          percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
        })
      );

      return { categories };
    } catch (error) {
      this.logger.error('Failed to fetch stats by category', error);
      throw error;
    }
  }
}
