import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { GameRound } from './src/rounds/domain/game-round.entity';
import { Player } from './src/players/domain/player.entity';
import { Wallet } from './src/wallets/domain/wallet.entity';

export default defineConfig({
    host: 'localhost',
    port: 5432,
    user: 'jungle',
    password: 'jungle_dev_password',
    dbName: 'jungle_arcade',
    entities: [GameRound, Player, Wallet],
    extensions: [Migrator],
    migrations: {
        path: './migrations',
        pathTs: './migrations',
    },
});
