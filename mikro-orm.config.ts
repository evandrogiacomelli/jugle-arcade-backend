import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { GameRound } from './src/rounds/domain/game-round.entity';

export default defineConfig({
    host: 'localhost',
    port: 5432,
    user: 'jungle',
    password: 'jungle_dev_password',
    dbName: 'jungle_arcade',
    entities: [GameRound],
    extensions: [Migrator],
    migrations: {
        path: './migrations',
        pathTs: './migrations',
    },
});
