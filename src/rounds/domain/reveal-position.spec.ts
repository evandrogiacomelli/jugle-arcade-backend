import { GameRound } from "./game-round.entity";
import { revealPosition } from "./reveal-position";

function createRound(
    minePositions: number[] = [3],
): GameRound {
    const round = new GameRound();
    round.id = 1;
    round.status = 'PENDING';
    round.mineCount = minePositions.length;
    round.minePositions = minePositions;
    round.revealedPositions = [];
    round.createdAt = new Date();

    return round;
}

describe('revealPosition', () => {
    it('should reveal a safe position', () => {
        const round = createRound([3]);

        const result = revealPosition(round, 5);

        expect(result).toBe('SAFE');
        expect(round.revealedPositions).toEqual([5]);
        expect(round.status).toBe('IN_PROGRESS');
    });

    it('should lose when reveling mine', () => {
        const round = createRound([3]);

        const result = revealPosition(round,3);

        expect(result).toBe('MINE');
        expect(round.status).toBe('LOST');
    });

    it('should reject an invalid position', () => {
        const round = createRound();

        expect(() => revealPosition(round, 25)).toThrow();
    });

    it('should reject a position that was already revealed', () => {
        const round = createRound();
        revealPosition(round, 5);

        expect(() => revealPosition(round, 5)).toThrow();
    });
});
