import {
    Entity,
    PrimaryKey,
    Property,
    OneToOne,
} from '@mikro-orm/decorators/legacy';

import { Player } from '../../players/domain/player.entity';

@Entity()
export class Wallet {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @OneToOne(() => Player, { owner: true })
    player!: Player;

    @Property({ type: 'number' })
    balance = 0;
}
