import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { GameRound } from "./rounds/domain/game-round.entity";
import { Wallet } from "./wallets/domain/wallet.entity";
import { Player } from "./players/domain/player.entity";
import { RoundsModule } from "./rounds/rounds.module";
import { PlayersModule } from './players/players.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(
        defineConfig({
          host: 'localhost',
          port: 5432,
          user: 'jungle',
          password: 'jungle_dev_password',
          dbName: 'jungle_arcade',
          entities: [GameRound, Player, Wallet],
          allowGlobalContext: false,
        }),
    ),
      RoundsModule, PlayersModule
  ],
})
export class AppModule {}
