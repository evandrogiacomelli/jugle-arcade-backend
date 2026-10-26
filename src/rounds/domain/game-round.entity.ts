
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
    status = 'PENDING';

    @Property({ type: Date })
    createdAt = new Date();
}
