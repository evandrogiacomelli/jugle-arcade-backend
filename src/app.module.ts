import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import {GameRound} from "./rounds/domain/game-round.entity";

@Module({
  imports: [
    MikroOrmModule.forRoot(
        defineConfig({
          host: 'localhost',
          port: 5432,
          user: 'jungle',
          password: 'jungle_dev_password',
          dbName: 'jungle_arcade',
          entities: [GameRound],
          allowGlobalContext: false,
        }),
    ),
  ],
})
export class AppModule {}
