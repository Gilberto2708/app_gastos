import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        category: {
            id: string;
            createdat: Date;
            updatedat: Date;
            name: string;
            color: string;
            icon: string;
        };
    }>;
    findAll(): Promise<{
        categories: {
            id: string;
            createdat: Date;
            updatedat: Date;
            name: string;
            color: string;
            icon: string;
        }[];
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        category: {
            id: string;
            createdat: Date;
            updatedat: Date;
            name: string;
            color: string;
            icon: string;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
