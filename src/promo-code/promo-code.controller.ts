import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';

@Controller('promo-codes')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Post()
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(dto);
  }

  @Get()
  findAll() {
    return this.promoCodeService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodeService.findById(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActivatePromoCodeDto,
  ) {
    return this.promoCodeService.activate(id, dto.email);
  }
}
