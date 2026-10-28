import { EntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { GameRound } from './domain/game-round.entity';
import { RoundsService } from './rounds.service';
import { RoundsGateway } from "./rounds.gateway";

describe('RoundsService', () => {
    let service: RoundsService;
    let em: {
        create: jest.Mock;
        persist: jest.Mock;
        flush: jest.Mock;
        findOne: jest.Mock;
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
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoundsService,
                { provide: EntityManager, useValue: em },
                {provide: RoundsGateway, useValue: { emitRoundUpdate: jest.fn() } }
            ],
        }).compile();

        service = module.get<RoundsService>(RoundsService);
    });

    it('should create a round', async () => {
        const result = await service.create({ mineCount: 5 });

        expect(em.create).toHaveBeenCalledWith(
            GameRound,
            expect.objectContaining({
                status: 'PENDING',
                mineCount: 5,
                minePositions: expect.any(Array),
                revealedPositions: [],
                createdAt: expect.any(Date),
            }),
        );
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

    it('should return null when round does not exist', async () => {

        em.findOne = jest.fn().mockResolvedValue(null);

        const result = await service.reveal(999, 5);

        expect(result).toBeNull();
        expect(em.flush).not.toHaveBeenCalled();
    });

    it('should reveal a safe position', async () => {
        const round = {
            id: 1,
            status: 'PENDING',
            mineCount: 1,
            minePositions: [3],
            revealedPositions: [],
            createdAt: new Date(),
        };

        em.findOne.mockResolvedValue(round);

        const result = await service.reveal(1, 5);

        expect(result).toMatchObject({
            id: 1,
            status: 'IN_PROGRESS',
            position: 5,
            result: 'SAFE',
            revealedPositions: [5],
        });

        expect(em.flush).toHaveBeenCalled();
    });

    it('should lose when revealing a mine', async () => {
        const round = {
            id: 1,
            status: 'PENDING',
            mineCount: 1,
            minePositions: [3],
            revealedPositions: [],
            createdAt: new Date(),
        };

        em.findOne.mockResolvedValue(round);

        const result = await service.reveal(1, 3);

        expect(result).toMatchObject({
            id: 1,
            status: 'LOST',
            position: 3,
            result: 'MINE',
            revealedPositions: [3],
        });

        expect(em.flush).toHaveBeenCalled();
    });
});
