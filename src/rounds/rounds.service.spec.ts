import { EntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { GameRound } from './domain/game-round.entity';
import { RoundsService } from './rounds.service';

describe('RoundsService', () => {
    let service: RoundsService;
    let em: {
        create: jest.Mock;
        persist: jest.Mock;
        flush: jest.Mock;
    };

    beforeEach(async () => {
        em = {
            create: jest.fn().mockImplementation((_entity, data) => ({
                id: 1,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                ...data,
            })),
            persist: jest.fn(),
            flush: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoundsService,
                { provide: EntityManager, useValue: em },
            ],
        }).compile();

        service = module.get<RoundsService>(RoundsService);
    });

    it('should create a round', async () => {
        const result = await service.create({ mineCount: 5 });

        expect(em.create).toHaveBeenCalledWith(GameRound, {
            status: 'PENDING',
            mineCount: 5,
            createdAt: expect.any(Date),
        });
        expect(em.persist).toHaveBeenCalledWith(expect.objectContaining({
            status: 'PENDING',
            mineCount: 5,
        }));
        expect(em.flush).toHaveBeenCalled();
        expect(result).toEqual({
            id: 1,
            status: 'PENDING',
            mineCount: 5,
            createdAt: expect.any(Date),
        });
    });
});
