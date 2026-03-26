import { Injectable } from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';

@Injectable()
export class PromoCodeService {
  create(createPromoCodeDto: CreatePromoCodeDto) {
    return 'This action adds a new promoCode';
  }

  findAll() {
    return `This action returns all promoCode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} promoCode`;
  }

  update(id: number, updatePromoCodeDto: ActivatePromoCodeDto) {
    return `This action updates a #${id} promoCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} promoCode`;
  }
}
