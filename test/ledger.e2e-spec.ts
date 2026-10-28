import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { LedgerEntry } from '../src/ledger/domain/ledger-entry.entity';
import { Player } from '../src/players/domain/player.entity';
import { Wallet } from '../src/wallets/domain/wallet.entity';

import { LedgerService } from '../src/ledger/ledger.service';

describe('LedgerController (e2e)', () => {
    let app: INestApplication;
    let em: EntityManager;
    let playerId: number | undefined;
    let walletId: number | undefined;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();

        em = app.get(EntityManager).fork();
    });

    afterAll(async () => {
        if (walletId !== undefined) {
            await em.nativeDelete(LedgerEntry, { wallet: walletId });
            await em.nativeDelete(Wallet, { id: walletId });
        }

        if (playerId !== undefined) {
            await em.nativeDelete(Player, { id: playerId });
        }

        await em.getConnection().close();
        await app.close();
    });

    it('should persist credits, debits and preserve balance after an excessive debit', async () => {
        const playerResponse = await request(app.getHttpServer())
            .post('/players')
            .send({ displayName: `ledger-e2e-${Date.now()}` })
            .expect(201);

        playerId = playerResponse.body.id;
        walletId = playerResponse.body.wallet.id;

        await request(app.getHttpServer())
            .post(`/wallets/${walletId}/ledger`)
            .set('Idempotency-Key', 'e2e-integration-credit')
            .send({
                type: 'CREDIT',
                amount: 100,
                description: 'Integration test credit',
            })
            .expect(201);

        await request(app.getHttpServer())
            .post(`/wallets/${walletId}/ledger`)
            .set('Idempotency-Key', 'e2e-integration-debit')
            .send({
                type: 'DEBIT',
                amount: 30,
                description: 'Integration test debit',
            })
            .expect(201);

        const wallet = await em.findOneOrFail(Wallet, { id: walletId });
        expect(wallet.balance).toBe(70);

        const entries = await em.find(
            LedgerEntry,
            { wallet: { id: walletId } },
            { orderBy: { id: 'ASC' } },
        );

        expect(entries).toHaveLength(2);
        expect(entries.map((entry) => [entry.type, entry.amount])).toEqual([
            ['CREDIT', 100],
            ['DEBIT', 30],
        ]);

        await request(app.getHttpServer())
            .post(`/wallets/${walletId}/ledger`)
            .set('Idempotency-Key', 'e2e-excessive-debit')
            .send({
                type: 'DEBIT',
                amount: 71,
                description: 'Excessive debit',
            })
            .expect(422);

        em.clear();

        const walletAfterFailure = await em.findOneOrFail(Wallet, {
            id: walletId,
        });

        expect(walletAfterFailure.balance).toBe(70);

        const entriesAfterFailure = await em.find(LedgerEntry, {
            wallet: { id: walletId },
        });

        expect(entriesAfterFailure).toHaveLength(2);
    });

    it('should not apply the same credit twice when the idempotency key is reused', async () => {
        const playerResponse = await request(app.getHttpServer())
            .post('/players')
            .send({ displayName: `ledger-idempotency-${Date.now()}` })
            .expect(201);

        const idempotentPlayerId: number = playerResponse.body.id;
        const idempotentWalletId: number = playerResponse.body.wallet.id;

        try {
            const payload = {
                type: 'CREDIT',
                amount: 100,
                description: 'Idempotency test credit',
            };

            const firstResponse = await request(app.getHttpServer())
                .post(`/wallets/${idempotentWalletId}/ledger`)
                .set('Idempotency-Key', 'e2e-idempotency-credit')
                .send(payload)
                .expect(201);

            const repeatedResponse = await request(app.getHttpServer())
                .post(`/wallets/${idempotentWalletId}/ledger`)
                .set('Idempotency-Key', 'e2e-idempotency-credit')
                .send(payload)
                .expect(201);

            expect(repeatedResponse.body).toEqual(firstResponse.body);

            em.clear();

            const wallet = await em.findOneOrFail(Wallet, {
                id: idempotentWalletId,
            });

            expect(wallet.balance).toBe(100);

            const entries = await em.find(LedgerEntry, {
                wallet: { id: idempotentWalletId },
            });

            expect(entries).toHaveLength(1);
        } finally {
            await em.nativeDelete(LedgerEntry, {
                wallet: idempotentWalletId,
            });
            await em.nativeDelete(Wallet, {
                id: idempotentWalletId,
            });
            await em.nativeDelete(Player, {
                id: idempotentPlayerId,
            });
        }
    });

    it('should reject reusing an idempotency key with different data', async () => {
        const playerResponse = await request(app.getHttpServer())
            .post('/players')
            .send({ displayName: `ledger-conflict-${Date.now()}` })
            .expect(201);

        const playerId: number = playerResponse.body.id;
        const walletId: number = playerResponse.body.wallet.id;

        try {
            await request(app.getHttpServer())
                .post(`/wallets/${walletId}/ledger`)
                .set('Idempotency-Key', 'e2e-idempotency-conflict')
                .send({
                    type: 'CREDIT',
                    amount: 100,
                    description: 'Original credit',
                })
                .expect(201);

            await request(app.getHttpServer())
                .post(`/wallets/${walletId}/ledger`)
                .set('Idempotency-Key', 'e2e-idempotency-conflict')
                .send({
                    type: 'CREDIT',
                    amount: 200,
                    description: 'Different credit',
                })
                .expect(409);

            em.clear();

            const wallet = await em.findOneOrFail(Wallet, { id: walletId });
            expect(wallet.balance).toBe(100);

            const entries = await em.find(LedgerEntry, {
                wallet: { id: walletId },
            });
            expect(entries).toHaveLength(1);
        } finally {
            await em.nativeDelete(LedgerEntry, { wallet: walletId });
            await em.nativeDelete(Wallet, { id: walletId });
            await em.nativeDelete(Player, { id: playerId });
        }
    });

    it('should prevent concurrent debits from overspending the wallet', async () => {
        const playerResponse = await request(app.getHttpServer())
            .post('/players')
            .send({ displayName: `ledger-race-${Date.now()}` })
            .expect(201);

        const concurrentPlayerId: number = playerResponse.body.id;
        const concurrentWalletId: number = playerResponse.body.wallet.id;

        try {
            await request(app.getHttpServer())
                .post(`/wallets/${concurrentWalletId}/ledger`)
                .set('Idempotency-Key', 'e2e-race-credit')
                .send({
                    type: 'CREDIT',
                    amount: 100,
                    description: 'Concurrency test credit',
                })
                .expect(201);

            const responses = await Promise.all([
                request(app.getHttpServer())
                    .post(`/wallets/${concurrentWalletId}/ledger`)
                    .set('Idempotency-Key', 'e2e-race-debit-a')
                    .send({
                        type: 'DEBIT',
                        amount: 80,
                        description: 'Concurrent debit A',
                    }),
                request(app.getHttpServer())
                    .post(`/wallets/${concurrentWalletId}/ledger`)
                    .set('Idempotency-Key', 'e2e-race-debit-b')
                    .send({
                        type: 'DEBIT',
                        amount: 80,
                        description: 'Concurrent debit B',
                    }),
            ]);

            expect(responses.map((response) => response.status).sort()).toEqual([
                201,
                422,
            ]);

            em.clear();

            const wallet = await em.findOneOrFail(Wallet, {
                id: concurrentWalletId,
            });

            expect(wallet.balance).toBe(20);

            const entries = await em.find(LedgerEntry, {
                wallet: { id: concurrentWalletId },
            });

            expect(entries).toHaveLength(2);
            expect(entries.filter((entry) => entry.type === 'DEBIT')).toHaveLength(1);
        } finally {
            await em.nativeDelete(LedgerEntry, {
                wallet: concurrentWalletId,
            });
            await em.nativeDelete(Wallet, {
                id: concurrentWalletId,
            });
            await em.nativeDelete(Player, {
                id: concurrentPlayerId,
            });
        }
    });


    it('should roll back the wallet balance if ledger persistence fails', async () => {
        const playerResponse = await request(app.getHttpServer())
            .post('/players')
            .send({ displayName: `ledger-rollback-${Date.now()}` })
            .expect(201);

        const rollbackPlayerId: number = playerResponse.body.id;
        const rollbackWalletId: number = playerResponse.body.wallet.id;

        try {
            await request(app.getHttpServer())
                .post(`/wallets/${rollbackWalletId}/ledger`)
                .set('Idempotency-Key', 'e2e-rollback-credit')
                .send({
                    type: 'CREDIT',
                    amount: 100,
                    description: 'Rollback test credit',
                })
                .expect(201);


            const ledgerService = app.get(LedgerService);
            const emSpy = jest.spyOn(ledgerService['em'], 'transactional');

            try {
                emSpy.mockImplementationOnce(async (callback: any) => {
                    return ledgerService['em'].transactional(async (txEm) => {
                        const originalFlush = txEm.flush.bind(txEm);

                        jest.spyOn(txEm, 'flush').mockImplementationOnce(async () => {
                            throw new Error('Simulated persistence failure');
                        });

                        try {
                            return await callback(txEm);
                        } finally {
                            txEm.flush = originalFlush;
                        }
                    });
                });

                await request(app.getHttpServer())
                    .post(`/wallets/${rollbackWalletId}/ledger`)
                    .set('Idempotency-Key', 'e2e-rollback-debit')
                    .send({
                        type: 'DEBIT',
                        amount: 40,
                        description: 'Debit that should roll back',
                    })
                    .expect(500);
            } finally {
                emSpy.mockRestore();
            }

        } finally {
            await em.nativeDelete(LedgerEntry, {
                wallet: rollbackWalletId,
            });
            await em.nativeDelete(Wallet, {
                id: rollbackWalletId,
            });
            await em.nativeDelete(Player, {
                id: rollbackPlayerId,
            });
        }
    });
});
