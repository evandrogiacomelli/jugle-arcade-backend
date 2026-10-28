import { Migration } from '@mikro-orm/migrations';

export class Migration20261028175317 extends Migration {

  override name = 'Migration20261028175317';

  override up(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" add constraint "ledger_entry_wallet_idempotency_key_unique" unique ("wallet_id", "idempotency_key");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "ledger_entry" drop constraint "ledger_entry_wallet_idempotency_key_unique";`);
  }

}
