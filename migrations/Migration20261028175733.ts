import { Migration } from '@mikro-orm/migrations';

export class Migration20261028175733 extends Migration {

  override name = 'Migration20261028175733';

  override up(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" add "balance_after" int null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" drop column "balance_after";`);
  }

}
