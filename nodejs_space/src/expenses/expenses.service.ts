import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    try {
      const expense = await this.prisma.expenses.create({
        data: {
          amount: new Prisma.Decimal(createExpenseDto.amount),
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
    } catch (error) {
      this.logger.error('Failed to create expense', error);
      throw error;
    }
  }

  async findAll(query: QueryExpensesDto) {
    try {
      const where: any = {};

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

      const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      return {
        expenses: expenses.map(exp => this.formatExpense(exp)),
        total: Number(total.toFixed(2)),
      };
    } catch (error) {
      this.logger.error('Failed to fetch expenses', error);
      throw error;
    }
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      const data: any = {};
      
      if (updateExpenseDto.amount !== undefined) {
        data.amount = new Prisma.Decimal(updateExpenseDto.amount);
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
    } catch (error) {
      this.logger.error(`Failed to update expense: ${id}`, error);
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.expenses.delete({
        where: { id },
      });
      this.logger.log(`Expense deleted: ${id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete expense: ${id}`, error);
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense not found');
      }
      throw error;
    }
  }

  private formatExpense(expense: any) {
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
}
