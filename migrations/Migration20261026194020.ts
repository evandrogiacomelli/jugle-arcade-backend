import { Migration } from '@mikro-orm/migrations';

export class Migration20261026194020 extends Migration {

  override name = 'Migration20261026194020';

  override up(): void | Promise<void> {
    this.addSql(`alter table "game_round" add "mine_count" int not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "game_round" drop column "mine_count";`);
  }

}
