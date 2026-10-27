
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LedgerEntry } from './domain/ledger-entry.entity';
import { Wallet } from '../wallets/domain/wallet.entity';
import { LedgerService } from './ledger.service';

@Module({
  imports: [MikroOrmModule.forFeature([LedgerEntry, Wallet])],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
