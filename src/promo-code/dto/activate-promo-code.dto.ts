import { PartialType } from '@nestjs/mapped-types';
import { CreatePromoCodeDto } from './create-promo-code.dto';

export class ActivatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}
