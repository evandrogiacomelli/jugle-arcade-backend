import { Migration } from '@mikro-orm/migrations';

export class Migration20261027224036 extends Migration {

  override name = 'Migration20261027224036';

  override up(): void | Promise<void> {
    this.addSql(`create table "ledger_entry" ("id" serial primary key, "wallet_id" int not null, "type" varchar(255) not null, "amount" int not null, "description" varchar(255) not null, "created_at" timestamptz not null);`);

    this.addSql(`alter table "ledger_entry" add constraint "ledger_entry_wallet_id_foreign" foreign key ("wallet_id") references "wallet" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "ledger_entry" cascade;`);
  }

}
