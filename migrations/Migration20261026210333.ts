import { Migration } from '@mikro-orm/migrations';

export class Migration20261026210333 extends Migration {

  override name = 'Migration20261026210333';

  override up(): void | Promise<void> {
    this.addSql(`alter table "game_round" add "mine_positions" jsonb not null, add "revealed_positions" jsonb not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "game_round" drop column "mine_positions", drop column "revealed_positions";`);
  }

}
