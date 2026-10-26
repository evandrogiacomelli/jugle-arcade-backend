import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { RoundsService } from './../src/rounds/rounds.service';

describe('RoundsController (e2e)', () => {
  let app: INestApplication;

  const roundsService = {
    create: jest.fn().mockImplementation(async (dto: { mineCount: number }) => ({
      id: 1,
      status: 'PENDING',
      mineCount: dto.mineCount,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
        .overrideProvider(RoundsService)
        .useValue(roundsService)
        .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    );

    await app.init();
  });

  beforeEach(() => {
    roundsService.create.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a round with valid mineCount', async () => {
    const response = await request(app.getHttpServer())
        .post('/rounds')
        .send({ mineCount: 5 })
        .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      status: 'PENDING',
      mineCount: 5,
    });

    expect(roundsService.create).toHaveBeenCalledWith({ mineCount: 5 });
  });

  it.each([0, 25, -1])(
      'should reject mineCount=%i',
      async (mineCount) => {
        await request(app.getHttpServer())
            .post('/rounds')
            .send({ mineCount })
            .expect(400);

        expect(roundsService.create).not.toHaveBeenCalled();
      },
  );

  it('should reject a missing mineCount', async () => {
    await request(app.getHttpServer())
        .post('/rounds')
        .send({})
        .expect(400);

    expect(roundsService.create).not.toHaveBeenCalled();
  });

  it('should reject a non-numeric mineCount', async () => {
    await request(app.getHttpServer())
        .post('/rounds')
        .send({ mineCount: 'abc' })
        .expect(400);

    expect(roundsService.create).not.toHaveBeenCalled();
  });
});
