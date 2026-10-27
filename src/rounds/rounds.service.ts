import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { GameRound } from './domain/game-round.entity';
import { CreateRoundDto } from './dto/create-round.dto';

@Injectable()
export class RoundsService {
    constructor(private readonly em: EntityManager) {}

    async create(dto: CreateRoundDto): Promise<{ id: number, status: string, mineCount: number, createdAt: Date }> {
        const round = this.em.create(GameRound, {
            status: 'PENDING',
            mineCount: dto.mineCount,
            minePositions: [],
            revealedPositions: [],
            createdAt: new Date(),
        });

        this.em.persist(round);
        await this.em.flush();

        return {
            id: round.id,
            status: round.status,
            mineCount: round.mineCount,
            createdAt: round.createdAt,
        };
    }

    async findById(id: number) {
        const round = await this.em.findOne(GameRound, { id });

        if (!round) {
            return null;
        }

        return {
            id: round.id,
            status: round.status,
            mineCount: round.mineCount,
            revealedPositions: round.revealedPositions,
            createdAt: round.createdAt,
        };
    }
}
