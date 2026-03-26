import {
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent: number;

  @IsInt()
  @Min(1)
  activationLimit: number;

  @IsDateString()
  expiresAt: string;
}
