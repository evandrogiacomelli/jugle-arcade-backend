import { Migration } from '@mikro-orm/migrations';

export class Migration20261026191016 extends Migration {

  override name = 'Migration20261026191016';

  override up(): void | Promise<void> {
    this.addSql(`create table "game_round" ("id" serial primary key, "status" varchar(255) not null default 'PENDING', "created_at" timestamptz not null);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "game_round" cascade;`);
  }

}
