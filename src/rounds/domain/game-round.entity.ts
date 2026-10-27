import {
    Entity,
    PrimaryKey,
    Property,
} from '@mikro-orm/decorators/legacy';

export type RoundStatus = 'PENDING' | 'IN_PROGRESS' | 'WON' | 'LOST';

@Entity()
export class GameRound {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @Property({ type: 'string' })
    status: RoundStatus = 'PENDING';

    @Property({ type: 'number' })
    mineCount!: number;

    @Property({ type: 'json' })
    minePositions: number[] = [];

    @Property({ type: 'json' })
    revealedPositions: number[] = [];

    @Property({ type: Date })
    createdAt: Date = new Date();
}
