import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PromoCodeModule } from './promo-code/promo-code.module';

@Module({
  imports: [PrismaModule, PromoCodeModule],
})
export class AppModule {}
