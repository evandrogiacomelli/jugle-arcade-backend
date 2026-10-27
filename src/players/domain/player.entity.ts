import {
    Entity,
    PrimaryKey,
    Property,
} from '@mikro-orm/decorators/legacy';

@Entity()
export class Player {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @Property({ type: 'string' })
    displayName!: string;

    @Property({ type: Date })
    createdAt: Date = new Date();
}
