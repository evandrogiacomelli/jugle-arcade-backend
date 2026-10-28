import {
    Check,
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
    Unique
} from '@mikro-orm/decorators/legacy';

import { Wallet } from '../../wallets/domain/wallet.entity';

export type LedgerEntryType = 'CREDIT' | 'DEBIT';

@Entity()
@Check({
    name: 'ledger_entry_type_check',
    expression: `"type" in ('CREDIT', 'DEBIT')`,
})
@Check({
    name: 'ledger_entry_amount_positive_check',
    expression: '"amount" > 0',
})
@Unique({
    name: 'ledger_entry_wallet_idempotency_key_unique',
    properties: ['wallet', 'idempotencyKey'],
})
export class LedgerEntry {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @Property({ type: 'string', nullable: true, length: 100 })
    idempotencyKey?: string;

    @ManyToOne(() => Wallet)
    wallet!: Wallet;

    @Property({ type: 'string' })
    type!: LedgerEntryType;

    @Property({ type: 'number' })
    amount!: number;

    @Property({ type: 'string' })
    description!: string;

    @Property({ type: 'number', nullable: true })
    balanceAfter?: number;

    @Property({ type: Date })
    createdAt: Date = new Date();
}
