import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prisma.categories.create({
        data: createCategoryDto,
      });
      this.logger.log(`Category created: ${category.id}`);
      return { category };
    } catch (error) {
      this.logger.error('Failed to create category', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const categories = await this.prisma.categories.findMany({
        orderBy: { createdat: 'asc' },
      });
      return { categories };
    } catch (error) {
      this.logger.error('Failed to fetch categories', error);
      throw error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.categories.update({
        where: { id },
        data: updateCategoryDto,
      });
      this.logger.log(`Category updated: ${id}`);
      return { category };
    } catch (error) {
      this.logger.error(`Failed to update category: ${id}`, error);
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.categories.delete({
        where: { id },
      });
      this.logger.log(`Category deleted: ${id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete category: ${id}`, error);
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }
}
