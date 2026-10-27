import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Player } from './domain/player.entity';
import { Wallet } from '../wallets/domain/wallet.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
    imports: [MikroOrmModule.forFeature([Player, Wallet])],
    controllers: [PlayersController],
    providers: [PlayersService],
})
export class PlayersModule {}
