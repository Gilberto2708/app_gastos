import { StatsService } from './stats.service';
import { QueryStatsDto } from './dto/query-stats.dto';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
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
