import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class QueryStatsDto {
  @ApiProperty({ example: '2026-02-10', description: 'Start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-02-17', description: 'End date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
