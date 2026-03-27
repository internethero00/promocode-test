import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromoCodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePromoCodeDto) {
    try {
      return await this.prismaService.promoCode.create({
        data: {
          code: dto.code.toUpperCase().trim(),
          discountPercent: dto.discountPercent,
          activationLimit: dto.activationLimit,
          expiresAt: new Date(dto.expiresAt),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Promo code "${dto.code}" already exists`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prismaService.promoCode.findMany({
      include: { _count: { select: { activations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const promoCode = await this.prismaService.promoCode.findUnique({
      where: { id },
      include: {
        activations: { orderBy: { activatedAt: 'desc' } },
        _count: { select: { activations: true } },
      },
    });

    if (!promoCode) {
      throw new NotFoundException(`Promo code not found`);
    }

    return promoCode;
  }

  async activate(id: string, email: string) {
    return this.prismaService.$transaction(
      async (tx) => {
        const promoCode = await tx.promoCode.findUnique({
          where: { id },
          include: { _count: { select: { activations: true } } },
        });

        if (!promoCode) {
          throw new NotFoundException('Promo code not found');
        }

        if (new Date() > promoCode.expiresAt) {
          throw new BadRequestException('Promo code has expired');
        }

        if (promoCode._count.activations >= promoCode.activationLimit) {
          throw new BadRequestException('Activation limit reached');
        }

        try {
          return await tx.activation.create({
            data: {
              promoCodeId: id,
              email: email.toLowerCase().trim(),
            },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            throw new ConflictException(
              'This email has already activated this promo code',
            );
          }
          throw error;
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
