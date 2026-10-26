import {
    Entity,
    PrimaryKey,
    Property,
} from '@mikro-orm/decorators/legacy';

@Entity()
export class GameRound {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @Property({ type: 'string' })
    status: string = 'PENDING';

    @Property({ type: 'number' })
    mineCount!: number;

    @Property({ type: Date })
    createdAt: Date = new Date();
}
