import { Migration } from '@mikro-orm/migrations';

export class Migration20261027224156 extends Migration {

  override name = 'Migration20261027224156';

  override up(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" add constraint "ledger_entry_amount_positive_check" check ("amount" > 0);`);
    this.addSql(`alter table "ledger_entry" add constraint "ledger_entry_type_check" check ("type" in ('CREDIT', 'DEBIT'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" drop constraint "ledger_entry_amount_positive_check";`);
    this.addSql(`alter table "ledger_entry" drop constraint "ledger_entry_type_check";`);
  }

}
