import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { QueryStatsDto } from './dto/query-stats.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly statistics' })
  @ApiResponse({ status: 200, description: 'Weekly stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWeeklyStats(@Query() query: QueryStatsDto) {
    return this.statsService.getWeeklyStats(query);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get statistics by category' })
  @ApiResponse({ status: 200, description: 'Category stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStatsByCategory(@Query() query: QueryStatsDto) {
    return this.statsService.getStatsByCategory(query);
  }
}
