export const BOARD_SIZE = 25;

export function generateMinePositions(mineCount: number): number[] {
    if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount >= BOARD_SIZE) {
        throw new Error('Mine count must be between 1 and 24');
    }

    const positions = Array.from(
        { length: BOARD_SIZE },
        (_, index) => index,
    );

    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    return positions.slice(0, mineCount);
}
