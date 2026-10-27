import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { LockMode } from '@mikro-orm/core';

import { LedgerEntry, LedgerEntryType } from './domain/ledger-entry.entity';
import { Wallet } from '../wallets/domain/wallet.entity';

interface CreateLedgerEntryInput {
    walletId: number;
    type: LedgerEntryType;
    amount: number;
    description: string;
}

@Injectable()
export class LedgerService {
    constructor(private readonly em: EntityManager) {}

    async create(input: CreateLedgerEntryInput) {
        if (!Number.isInteger(input.amount) || input.amount <= 0) {
            throw new Error('Amount must be a positive integer');
        }

        if (!['CREDIT', 'DEBIT'].includes(input.type)) {
            throw new Error('Invalid ledger entry type');
        }

        return this.em.transactional(async (em) => {
            const wallet = await em.findOne(
                Wallet,
                { id: input.walletId },
                { lockMode:  LockMode.PESSIMISTIC_WRITE },
            );

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            const newBalance =
                input.type === 'CREDIT'
                    ? wallet.balance + input.amount
                    : wallet.balance - input.amount;

            if (newBalance < 0) {
                throw new Error('Insufficient balance');
            }

            wallet.balance = newBalance;

            const entry = em.create(LedgerEntry, {
                wallet,
                type: input.type,
                amount: input.amount,
                description: input.description,
                createdAt: new Date(),
            });

            await em.flush();

            return {
                id: entry.id,
                walletId: wallet.id,
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                balanceAfter: wallet.balance,
                createdAt: entry.createdAt,
            };
        });
    }
}
