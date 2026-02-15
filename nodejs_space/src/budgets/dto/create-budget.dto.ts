import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { BudgetType } from '@prisma/client';

export class CreateBudgetDto {
  @ApiProperty({ example: 1000, description: 'Budget amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'WEEKLY', enum: BudgetType, description: 'Budget type' })
  @IsEnum(BudgetType)
  type: BudgetType;

  @ApiProperty({ example: '2026-02-15', description: 'Budget start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-22', description: 'Budget end date' })
  @IsDateString()
  endDate: string;
}
