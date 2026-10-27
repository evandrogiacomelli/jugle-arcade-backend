import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LedgerController } from './ledger.controller';
import { LedgerEntry } from './domain/ledger-entry.entity';
import { LedgerService } from './ledger.service';
import { Wallet } from '../wallets/domain/wallet.entity';

@Module({
  imports: [MikroOrmModule.forFeature([LedgerEntry, Wallet])],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
