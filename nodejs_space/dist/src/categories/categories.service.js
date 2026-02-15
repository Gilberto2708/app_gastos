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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    prisma;
    logger = new common_1.Logger(CategoriesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        try {
            const category = await this.prisma.categories.create({
                data: createCategoryDto,
            });
            this.logger.log(`Category created: ${category.id}`);
            return { category };
        }
        catch (error) {
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
        }
        catch (error) {
            this.logger.error('Failed to fetch categories', error);
            throw error;
        }
    }
    async update(id, updateCategoryDto) {
        try {
            const category = await this.prisma.categories.update({
                where: { id },
                data: updateCategoryDto,
            });
            this.logger.log(`Category updated: ${id}`);
            return { category };
        }
        catch (error) {
            this.logger.error(`Failed to update category: ${id}`, error);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Category not found');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.prisma.categories.delete({
                where: { id },
            });
            this.logger.log(`Category deleted: ${id}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete category: ${id}`, error);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Category not found');
            }
            throw error;
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map