import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  private readonly logger = new Logger(BudgetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    try {
      const budget = await this.prisma.budgets.create({
        data: {
          amount: new Prisma.Decimal(createBudgetDto.amount),
          type: createBudgetDto.type,
          startdate: new Date(createBudgetDto.startDate),
          enddate: new Date(createBudgetDto.endDate),
        },
      });
      this.logger.log(`Budget created: ${budget.id}`);
      return { budget: this.formatBudget(budget) };
    } catch (error) {
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
    } catch (error) {
      this.logger.error('Failed to fetch budgets', error);
      throw error;
    }
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    try {
      const data: any = {};
      
      if (updateBudgetDto.amount !== undefined) {
        data.amount = new Prisma.Decimal(updateBudgetDto.amount);
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
    } catch (error) {
      this.logger.error(`Failed to update budget: ${id}`, error);
      if (error.code === 'P2025') {
        throw new NotFoundException('Budget not found');
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
        throw new NotFoundException('No active budget found');
      }

      const expenses = await this.prisma.expenses.findMany({
        where: {
          date: {
            gte: budget.startdate,
            lte: budget.enddate,
          },
        },
      });

      const spent = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      const budgetAmount = Number(budget.amount);
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      return {
        budget: this.formatBudget(budget),
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        percentage,
      };
    } catch (error) {
      this.logger.error('Failed to fetch current budget', error);
      throw error;
    }
  }

  private formatBudget(budget: any) {
    return {
      id: budget.id,
      amount: Number(budget.amount),
      type: budget.type,
      startDate: budget.startdate,
      endDate: budget.enddate,
    };
  }
}
