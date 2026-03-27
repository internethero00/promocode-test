import {
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

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
  @IsFutureDate()
  expiresAt: string;
}
