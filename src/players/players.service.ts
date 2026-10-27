import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import { Player } from './domain/player.entity';
import { Wallet } from '../wallets/domain/wallet.entity';
import { CreatePlayerDto } from './dto/create-player.dto';

@Injectable()
export class PlayersService {
    constructor(private readonly em: EntityManager) {}

    async create(dto: CreatePlayerDto) {
        return this.em.transactional(async (em) => {
            const player = em.create(Player, {
                displayName: dto.displayName,
                createdAt: new Date(),
            });

            const wallet = em.create(Wallet, {
                player,
                balance: 0,
            });

            em.persist([player, wallet]);
            await em.flush();

            return {
                id: player.id,
                displayName: player.displayName,
                wallet: {
                    id: wallet.id,
                    balance: wallet.balance,
                },
                createdAt: player.createdAt,
            };
        });
    }
}
