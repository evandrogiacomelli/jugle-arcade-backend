import {
    Check,
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
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
export class LedgerEntry {
    @PrimaryKey({ type: 'number', autoincrement: true })
    id!: number;

    @ManyToOne(() => Wallet)
    wallet!: Wallet;

    @Property({ type: 'string' })
    type!: LedgerEntryType;

    @Property({ type: 'number' })
    amount!: number;

    @Property({ type: 'string' })
    description!: string;

    @Property({ type: Date })
    createdAt: Date = new Date();
}
