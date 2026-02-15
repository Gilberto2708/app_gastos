import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryExpensesDto {
  @ApiProperty({ example: '2026-01-01', description: 'Start date', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-01-31', description: 'End date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID filter', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
