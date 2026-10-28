import {
    Body,
    Controller,
    Headers,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { LedgerService } from './ledger.service';

@Controller('wallets/:walletId/ledger')
export class LedgerController {
    constructor(private readonly ledgerService: LedgerService) {}

    @Post()
    create(
        @Param('walletId', ParseIntPipe) walletId: number,
        @Headers('idempotency-key') idempotencyKey: string,
        @Body() dto: CreateLedgerEntryDto,
    ) {
        return this.ledgerService.create({
            walletId,
            idempotencyKey,
            type: dto.type,
            amount: dto.amount,
            description: dto.description,
        });
    }
}
