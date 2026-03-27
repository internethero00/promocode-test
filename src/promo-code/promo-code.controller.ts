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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Promo Codes')
@Controller('promo-codes')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a promo code' })
  @ApiResponse({ status: 201, description: 'Promo code created' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all promo codes' })
  findAll() {
    return this.promoCodeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promo code by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodeService.findById(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate promo code by email' })
  @ApiResponse({ status: 200, description: 'Activated successfully' })
  @ApiResponse({ status: 400, description: 'Expired or limit reached' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Already activated by this email' })
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActivatePromoCodeDto,
  ) {
    return this.promoCodeService.activate(id, dto.email);
  }
}
