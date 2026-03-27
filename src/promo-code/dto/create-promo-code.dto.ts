import {
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({ example: 15, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent: number;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt()
  @Min(1)
  activationLimit: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsFutureDate()
  expiresAt: string;
}
