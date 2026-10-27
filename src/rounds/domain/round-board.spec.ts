import { generateMinePositions } from './round-board';

describe('generateMinePositions', () => {
    it('should generate the requested number of unique positions', () => {
        const positions = generateMinePositions(5);

        expect(positions).toHaveLength(5);
        expect(new Set(positions).size).toBe(5);
        expect(positions.every((position) => position >= 0 && position < 25))
            .toBe(true);
    });

    it.each([0, 25, -1, 1.5])(
        'should reject invalid mine count: %s',
        (mineCount) => {
            expect(() => generateMinePositions(mineCount)).toThrow();
        },
    );
});
