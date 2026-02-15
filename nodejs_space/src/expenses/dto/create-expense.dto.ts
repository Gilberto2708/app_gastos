import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 100.50, description: 'Expense amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'uuid', description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: '2026-02-15', description: 'Expense date' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Grocery shopping', description: 'Expense description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://ocr.space/Content/Images/receipt-ocr-original.webp', description: 'Receipt URL', required: false })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
