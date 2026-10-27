import { Migration } from '@mikro-orm/migrations';

export class Migration20261027215928 extends Migration {

  override name = 'Migration20261027215928';

  override up(): void | Promise<void> {
    this.addSql(`create table "player" ("id" serial primary key, "display_name" varchar(255) not null, "created_at" timestamptz not null);`);

    this.addSql(`create table "wallet" ("id" serial primary key, "player_id" int not null, "balance" int not null default 0);`);
    this.addSql(`alter table "wallet" add constraint "wallet_player_id_unique" unique ("player_id");`);

    this.addSql(`alter table "wallet" add constraint "wallet_player_id_foreign" foreign key ("player_id") references "player" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "wallet" drop constraint "wallet_player_id_foreign";`);

    this.addSql(`drop table if exists "player" cascade;`);
    this.addSql(`drop table if exists "wallet" cascade;`);
  }

}
