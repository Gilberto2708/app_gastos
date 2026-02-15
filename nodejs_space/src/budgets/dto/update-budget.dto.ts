import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { BudgetType } from '@prisma/client';

export class UpdateBudgetDto {
  @ApiProperty({ example: 1200, description: 'Budget amount', required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'MONTHLY', enum: BudgetType, description: 'Budget type', required: false })
  @IsEnum(BudgetType)
  @IsOptional()
  type?: BudgetType;
}
