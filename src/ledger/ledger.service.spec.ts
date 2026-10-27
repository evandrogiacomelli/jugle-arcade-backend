
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';

import { LedgerService } from './ledger.service';
import { LedgerEntry } from './domain/ledger-entry.entity';
import { Wallet } from '../wallets/domain/wallet.entity';

describe('LedgerService', () => {
  let service: LedgerService;

  const wallet = {
    id: 1,
    balance: 100,
  } as Wallet;

  const transactionEm = {
    findOne: jest.fn(),
    create: jest.fn(),
    flush: jest.fn(),
  };

  const emMock = {
    transactional: jest.fn(
        async (callback: (em: typeof transactionEm) => Promise<unknown>) =>
            callback(transactionEm),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    wallet.balance = 100;

    transactionEm.findOne.mockResolvedValue(wallet);
    transactionEm.create.mockImplementation(
        (_entity, data) => ({ id: 10, ...data }),
    );
    transactionEm.flush.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        {
          provide: EntityManager,
          useValue: emMock,
        },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should credit the wallet and create a CREDIT entry', async () => {
    const result = await service.create({
      walletId: 1,
      type: 'CREDIT',
      amount: 50,
      description: 'Test credit',
    });

    expect(wallet.balance).toBe(150);
    expect(transactionEm.create).toHaveBeenCalledWith(
        LedgerEntry,
        expect.objectContaining({
          wallet,
          type: 'CREDIT',
          amount: 50,
        }),
    );
    expect(transactionEm.flush).toHaveBeenCalled();
    expect(result).toEqual(
        expect.objectContaining({
          id: 10,
          walletId: 1,
          type: 'CREDIT',
          amount: 50,
          balanceAfter: 150,
        }),
    );
  });

  it('should debit the wallet and create a DEBIT entry', async () => {
    const result = await service.create({
      walletId: 1,
      type: 'DEBIT',
      amount: 30,
      description: 'Test debit',
    });

    expect(wallet.balance).toBe(70);
    expect(result.balanceAfter).toBe(70);
    expect(transactionEm.create).toHaveBeenCalledWith(
        LedgerEntry,
        expect.objectContaining({
          type: 'DEBIT',
          amount: 30,
        }),
    );
  });

  it('should reject a debit when the balance is insufficient', async () => {
    await expect(
        service.create({
          walletId: 1,
          type: 'DEBIT',
          amount: 101,
          description: 'Excessive debit',
        }),
    ).rejects.toThrow('Insufficient balance');

    expect(wallet.balance).toBe(100);
    expect(transactionEm.create).not.toHaveBeenCalled();
  });

  it('should reject a wallet that does not exist', async () => {
    transactionEm.findOne.mockResolvedValue(null);

    await expect(
        service.create({
          walletId: 999,
          type: 'CREDIT',
          amount: 10,
          description: 'Missing wallet',
        }),
    ).rejects.toThrow('Wallet not found');

    expect(transactionEm.create).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5])(
      'should reject invalid amount %s',
      async (amount) => {
        await expect(
            service.create({
              walletId: 1,
              type: 'CREDIT',
              amount,
              description: 'Invalid amount',
            }),
        ).rejects.toThrow('Amount must be a positive integer');

        expect(emMock.transactional).not.toHaveBeenCalled();
      },
  );

  it('should reject an invalid entry type', async () => {
    await expect(
        service.create({
          walletId: 1,
          type: 'INVALID' as 'CREDIT',
          amount: 10,
          description: 'Invalid type',
        }),
    ).rejects.toThrow('Invalid ledger entry type');

    expect(emMock.transactional).not.toHaveBeenCalled();
  });
});
