import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PromoCode API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.activation.deleteMany();
    await prisma.promoCode.deleteMany();
  });

  afterAll(async () => {
    await prisma.activation.deleteMany();
    await prisma.promoCode.deleteMany();
    await app.close();
  });

  // --- Creation ---

  describe('POST /promo-codes', () => {
    it('should create a promo code', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      const { status, body } = await request(app.getHttpServer())
        .post('/promo-codes')
        .send({
          code: 'SUMMER2026',
          discountPercent: 15,
          activationLimit: 100,
          expiresAt: '2027-12-31T23:59:59.000Z',
        });

      expect(status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.code).toBe('SUMMER2026');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.discountPercent).toBe(15);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.id).toBeDefined();
    });

    it('should return 409 for duplicate code', async () => {
      const dto = {
        code: 'DUPLICATE',
        discountPercent: 10,
        activationLimit: 5,
        expiresAt: '2027-12-31T23:59:59.000Z',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/promo-codes').send(dto);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes')
        .send(dto);

      expect(status).toBe(409);
    });

    it('should return 400 for invalid discount percent', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes')
        .send({
          code: 'INVALID',
          discountPercent: 150,
          activationLimit: 10,
          expiresAt: '2027-12-31T23:59:59.000Z',
        });

      expect(status).toBe(400);
    });

    it('should return 400 for past expiration date', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes')
        .send({
          code: 'EXPIRED',
          discountPercent: 10,
          activationLimit: 10,
          expiresAt: '2020-01-01T00:00:00.000Z',
        });

      expect(status).toBe(400);
    });
  });

  // --- Retrieval ---

  describe('GET /promo-codes', () => {
    it('should return empty array when no promo codes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      const { status, body } = await request(app.getHttpServer()).get(
        '/promo-codes',
      );

      expect(status).toBe(200);
      expect(body).toEqual([]);
    });

    it('should return all promo codes with activation count', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/promo-codes').send({
        code: 'FIRST',
        discountPercent: 10,
        activationLimit: 5,
        expiresAt: '2027-12-31T23:59:59.000Z',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      const { status, body } = await request(app.getHttpServer()).get(
        '/promo-codes',
      );

      expect(status).toBe(200);
      expect(body).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body[0]._count.activations).toBe(0);
    });
  });

  describe('GET /promo-codes/:code', () => {
    it('should return promo code by code', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/promo-codes').send({
        code: 'FINDME',
        discountPercent: 20,
        activationLimit: 10,
        expiresAt: '2027-12-31T23:59:59.000Z',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      const { status, body } = await request(app.getHttpServer()).get(
        '/promo-codes/FINDME',
      );

      expect(status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.code).toBe('FINDME');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.activations).toEqual([]);
    });

    it('should return 404 for non-existent code', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer()).get(
        '/promo-codes/NONEXISTENT',
      );

      expect(status).toBe(404);
    });
  });

  // --- Activation ---

  describe('POST /promo-codes/:code/activate', () => {
    const createPromo = (
      code: string,
      activationLimit = 10,
      expiresAt = '2027-12-31T23:59:59.000Z',
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      request(app.getHttpServer())
        .post('/promo-codes')
        .send({ code, discountPercent: 15, activationLimit, expiresAt });

    it('should activate promo code', async () => {
      await createPromo('ACTIVATE');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
      const { status, body } = await request(app.getHttpServer())
        .post('/promo-codes/ACTIVATE/activate')
        .send({ email: 'user@test.com' });

      expect(status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.email).toBe('user@test.com');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(body.promoCodeId).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      await createPromo('DUPE');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/promo-codes/DUPE/activate')
        .send({ email: 'same@test.com' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes/DUPE/activate')
        .send({ email: 'same@test.com' });

      expect(status).toBe(409);
    });

    it('should return 400 when activation limit reached', async () => {
      await createPromo('LIMITED', 1);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/promo-codes/LIMITED/activate')
        .send({ email: 'first@test.com' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes/LIMITED/activate')
        .send({ email: 'second@test.com' });

      expect(status).toBe(400);
    });

    it('should return 400 for expired promo code', async () => {
      // Создаём напрямую через Prisma чтобы обойти валидацию DTO
      await prisma.promoCode.create({
        data: {
          code: 'OLDCODE',
          discountPercent: 10,
          activationLimit: 10,
          expiresAt: new Date('2020-01-01'),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes/OLDCODE/activate')
        .send({ email: 'user@test.com' });

      expect(status).toBe(400);
    });

    it('should return 404 for non-existent promo code', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes/NONEXISTENT/activate')
        .send({ email: 'user@test.com' });

      expect(status).toBe(404);
    });

    it('should return 400 for invalid email', async () => {
      await createPromo('BADEMAIL');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { status } = await request(app.getHttpServer())
        .post('/promo-codes/BADEMAIL/activate')
        .send({ email: 'not-an-email' });

      expect(status).toBe(400);
    });
  });
});
