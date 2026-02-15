import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateExpenseDto {
  @ApiProperty({ example: 120.00, description: 'Expense amount', required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'uuid', description: 'Category ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: '2026-02-15', description: 'Expense date', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: 'Updated description', description: 'Expense description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://templatelab.com/wp-content/uploads/2021/02/purchase-receipt-09-scaled.jpg', description: 'Receipt URL', required: false })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
