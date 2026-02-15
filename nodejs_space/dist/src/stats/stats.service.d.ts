import { PrismaService } from '../prisma/prisma.service';
import { QueryStatsDto } from './dto/query-stats.dto';
export declare class StatsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getWeeklyStats(query: QueryStatsDto): Promise<{
        total: number;
        byCategory: {
            categoryId: string;
            categoryName: string;
            total: number;
            percentage: number;
        }[];
        byDay: {
            date: string;
            total: number;
        }[];
    }>;
    getStatsByCategory(query: QueryStatsDto): Promise<{
        categories: {
            categoryId: string;
            name: string;
            color: string;
            total: number;
            percentage: number;
        }[];
    }>;
}
