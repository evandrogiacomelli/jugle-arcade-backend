import {GameRound} from "./game-round.entity";
import { RoundDomainException } from './round-domain.exception';

export type RevealResult = 'SAFE' | 'MINE';

export function revealPosition(
    round: GameRound,
    position: number,
): RevealResult {
    if (!Number.isInteger(position) || position < 0 || position >= 25) {
        throw new RoundDomainException('Position must be between 0 and 24');
    }

    if (round.status == 'WON' || round.status == 'LOST') {
        throw new RoundDomainException('Round is already finished');
    }

    if (round.revealedPositions.includes(position)) {
        throw new RoundDomainException('Position already revealed');
    }

    round.revealedPositions.push(position);

    if (round.minePositions.includes(position)) {
        round.status = 'LOST';
        return 'MINE';
    }

    if (round.revealedPositions.length === 25 - round.mineCount) {
        round.status = 'WON';
    } else {
        round.status = 'IN_PROGRESS';
    }

    return 'SAFE';
}
