import { Migration } from '@mikro-orm/migrations';

export class Migration20261028144254 extends Migration {

  override name = 'Migration20261028144254';

  override up(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" add "idempotency_key" varchar(100) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" drop column "idempotency_key";`);
  }

}
