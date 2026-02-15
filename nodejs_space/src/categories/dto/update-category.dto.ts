import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Food', description: 'Category name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '#FF5733', description: 'Hex color code', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color?: string;

  @ApiProperty({ example: 'food', description: 'Icon identifier', required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}
