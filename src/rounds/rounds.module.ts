import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GameRound } from './domain/game-round.entity';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';

@Module({
    imports: [MikroOrmModule.forFeature([GameRound])],
    controllers: [RoundsController],
    providers: [RoundsService],
})
export class RoundsModule {}
