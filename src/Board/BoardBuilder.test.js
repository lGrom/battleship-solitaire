/* eslint-disable no-undef */
import BoardBuilder, { RELATIVE_POSITIONS } from './BoardBuilder';
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';
import { act } from 'react';

test('board dimensions', () => {
    expect(new BoardBuilder(8, 8).width).toEqual(8);
    expect(new BoardBuilder(8, 8).height).toEqual(8);
});

test('pre-existing ships', () => {
    const preset = new BoardBuilder(4, 4).setShip([1, 2], new Ship(PLAY_TYPES.SHIP)).setShip([0, 0], new Ship(PLAY_TYPES.WATER));
    expect(new BoardBuilder(4, 4, preset).boardState[0]).toStrictEqual(new Ship(PLAY_TYPES.WATER));
    expect(new BoardBuilder(4, 4, preset).boardState[9]).toStrictEqual(new Ship(PLAY_TYPES.SHIP));
});

test('coordinatesToIndex', () => {
    expect(() => { new BoardBuilder().coordinatesToIndex([4, 6]); }).toThrow('must be within board');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([4, 6.2]); }).toThrow('must be integers');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([4.6, 6.2]); }).toThrow('must be integers');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([4.6, 6]); }).toThrow('must be integers');
    expect(new BoardBuilder(8, 8).coordinatesToIndex([4, 6])).toBe(52);
    expect(new BoardBuilder(4, 4).coordinatesToIndex([0, 1])).toBe(4);
});

test('indexToCoordinates and coordinatesToIndex are opposites', () => {
    const board = new BoardBuilder(8, 8);

    const index1 = board.coordinatesToIndex([2, 1]);
    const coordinates1 = board.indexToCoordinates(index1);

    const index2 = board.coordinatesToIndex([1, 7]);
    const coordinates2 = board.indexToCoordinates(index2);

    expect(coordinates1).toEqual([2, 1]);
    expect(coordinates2).toEqual([1, 7]);
});

test('setShip', async () => {
    const board = new BoardBuilder(8, 8);
    const ship = new Ship(PLAY_TYPES.WATER);

    await act(async () => {
        await board.setShip([1, 4], ship);
    });

    expect(board.boardState[board.coordinatesToIndex([1, 4])]).toEqual(ship);
});

test('getShip', () => {
    const board = new BoardBuilder(4, 4);
    const ship = new Ship(PLAY_TYPES.UNKNOWN);

    expect(board.getShip([1, 2])).toEqual(ship);
    expect(board.getShip(0)).toEqual(ship);

    expect(() => { board.getShip(-1); }).toThrow('index');
    expect(() => { board.getShip([4, 3]); }).toThrow('coordinates');
});

test('relativePositionToIndex', () => {
    const board = new BoardBuilder(4, 4);

    expect(board.relativePositionToIndex([1, 2], RELATIVE_POSITIONS.RIGHT)).toBe(10);
    expect(board.relativePositionToIndex([1, 2], RELATIVE_POSITIONS.TOP_LEFT)).toBe(4);
    expect(board.relativePositionToIndex([1, 2], RELATIVE_POSITIONS.BOTTOM)).toBe(13);
});

test('setRelativeShip', () => {
    const board = new BoardBuilder(4, 4);
    const ship = new Ship(PLAY_TYPES.SHIP);

    expect(board.setRelativeShip([1, 2], RELATIVE_POSITIONS.TOP_LEFT, ship).getShip([0, 1])).toEqual(ship);
    expect(board.setRelativeShip([1, 2], RELATIVE_POSITIONS.RIGHT, ship).getShip([2, 2])).toEqual(ship);
    expect(board.setRelativeShip([1, 2], RELATIVE_POSITIONS.BOTTOM, ship).getShip([1, 3])).toEqual(ship);
});

test('getRelativeShip', () => {
    const board1 = new BoardBuilder(4, 4);
    const board2 = new BoardBuilder(4, 4);
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);

    board1.setShip([2, 0], ship1);
    board2.setShip([2, 2], ship2);

    expect(board1.getRelativeShip([1, 1], RELATIVE_POSITIONS.TOP_RIGHT)).toBe(ship1);
    expect(board2.getRelativeShip([1, 1], RELATIVE_POSITIONS.BOTTOM_RIGHT)).toBe(ship2);

    expect(board1.getRelativeShip([0, 0], RELATIVE_POSITIONS.TOP)).toBeNull();
    expect(board1.getRelativeShip([0, 3], RELATIVE_POSITIONS.BOTTOM)).toBeNull();
});

test('pinned ships', () => {
    const preset = new BoardBuilder(4, 4).setShip([1, 1], GRAPHICAL_TYPES.SINGLE, true);
    const board = new BoardBuilder(4, 4, preset);
    board.computeGraphicalTypes();

    expect(board.boardState).toEqual(preset.boardState);
});

test('copy', () => {
    const board = new BoardBuilder(4, 4).setShip([1, 1], GRAPHICAL_TYPES.SINGLE, true);
    const copy = board.copy();

    expect(copy).toEqual(board);

    // test for mutation
    copy.setShip([0, 0], PLAY_TYPES.SHIP);

    expect(copy).not.toEqual(board);
});

// test board state is equal
test('equals', () => {
    const board = new BoardBuilder(6, 6)
        .setShip([4, 3], GRAPHICAL_TYPES.SINGLE)
        .setShip([0, 5], PLAY_TYPES.WATER);
    const sameBoard = new BoardBuilder(6, 6)
        .setShip(22, GRAPHICAL_TYPES.SINGLE)
        .setShip(30, PLAY_TYPES.WATER, true); // pinning it shouldn't do anything
    const diffBoard = new BoardBuilder(6, 6)
        .floodColumn(1)
        .floodColumn(3)
        .floodColumn(5)
        .floodRow(4)
        .floodRow(5, PLAY_TYPES.SHIP)
        .floodColumn(2, PLAY_TYPES.SHIP)
        .floodColumn(4, PLAY_TYPES.SHIP)
        .computeGraphicalTypes();
    const diffSizeBoard = new BoardBuilder(7, 6)
        .setShip([4, 3], GRAPHICAL_TYPES.SINGLE)
        .setShip([0, 5], PLAY_TYPES.WATER);

    expect(board.sameBoardState(diffBoard)).toBeFalsy();
    expect(board.sameBoardState(diffSizeBoard)).toBeFalsy();
    expect(board.sameBoardState(board)).toBeTruthy();
    expect(board.sameBoardState(sameBoard)).toBeTruthy();
});

const board = BoardBuilder.solve(
    new BoardBuilder(15, 15, undefined, undefined,
        [0, 5, 6, 1, 5, 1, 5, 1, 0, 5, 3, 0, 2, 0, 1],
        [2, 0, 1, 3, 4, 2, 3, 2, 4, 0, 4, 3, 3, 2, 2],
        [5, 4, 3, 2, 1])
        .setShip([3, 0], GRAPHICAL_TYPES.SHIP, true)
        .setShip([6, 0], GRAPHICAL_TYPES.WATER, true)
        .setShip([1, 2], GRAPHICAL_TYPES.WATER, true)
        .setShip([12, 2], GRAPHICAL_TYPES.SINGLE, true)
        .setShip([2, 3], GRAPHICAL_TYPES.LEFT, true)
        .setShip([5, 3], GRAPHICAL_TYPES.WATER, true)
        .setShip([10, 3], GRAPHICAL_TYPES.SHIP, true)
        .setShip([10, 4], GRAPHICAL_TYPES.VERTICAL, true)
        .setShip([12, 4], GRAPHICAL_TYPES.SINGLE, true)
        .setShip([2, 5], GRAPHICAL_TYPES.DOWN, true)
        .setShip([6, 6], GRAPHICAL_TYPES.SINGLE, true)
        .setShip([7, 6], GRAPHICAL_TYPES.WATER, true)
        .setShip([12, 6], GRAPHICAL_TYPES.WATER, true)
        .setShip([6, 7], GRAPHICAL_TYPES.WATER, true)
        .setShip([10, 7], GRAPHICAL_TYPES.WATER, true)
        .setShip([12, 7], GRAPHICAL_TYPES.WATER, true)
        .setShip([4, 8], GRAPHICAL_TYPES.SHIP, true)
        .setShip([9, 8], GRAPHICAL_TYPES.WATER, true)
        .setShip([2, 10], GRAPHICAL_TYPES.WATER, true)
        .setShip([6, 11], GRAPHICAL_TYPES.SHIP, true)
        .setShip([9, 11], GRAPHICAL_TYPES.SHIP, true)
        .setShip([14, 11], GRAPHICAL_TYPES.WATER, true)
        .setShip([2, 12], GRAPHICAL_TYPES.WATER, true)
        .setShip([3, 12], GRAPHICAL_TYPES.WATER, true)
        .setShip([7, 12], GRAPHICAL_TYPES.WATER, true)
        .setShip([9, 12], GRAPHICAL_TYPES.SHIP, true)
        .setShip([1, 13], GRAPHICAL_TYPES.UP, true)
        .setShip([6, 13], GRAPHICAL_TYPES.WATER, true)
        .setShip([3, 14], GRAPHICAL_TYPES.WATER, true)
        .setShip([14, 14], GRAPHICAL_TYPES.SINGLE, true)
        .computeGraphicalTypes()
);

test('get runs', () => {
    const horizontalRuns = board.getHorizontalRuns();
    const verticalRuns = board.getVerticalRuns();
    const allRuns = board.getRuns();

    const run1 = horizontalRuns[2];
    expect(run1.length).toEqual(2);
    expect(run1[0]).toEqual(board.positionToIndex([4, 4]));
    expect(run1[run1.length - 1]).toEqual(board.positionToIndex([5, 4]));

    const run2 = verticalRuns[4];
    expect(run2.length).toEqual(5);
    expect(run2[0]).toEqual(board.positionToIndex([9, 10]));
    expect(run2[run2.length - 1]).toEqual(board.positionToIndex([9, 14]));

    const run3 = allRuns[0];
    expect(run3.length).toEqual(1);
    expect(run3[0]).toEqual(board.positionToIndex([12, 2]));
    expect(run3[run3.length - 1]).toEqual(board.positionToIndex([12, 2]));

    // add testing to horizontal/vertical runs for onlyCountComplete = true -TODO
});

test('count runs left', () => {
    const expectedCounts = [0, 0, 0, 0, 0];
    const counts = board.countRunsLeft();

    expect(counts).toEqual(expectedCounts);
});

test('presets', () => {
    const board1 = new BoardBuilder(15, 15, board, undefined, board.columnCounts, board.rowCounts, board.runs);

    expect(board1.getShip([0, 0]).equals(new Ship(PLAY_TYPES.WATER))).toBeTruthy();
    expect(() => {
        // eslint-disable-next-line no-new
        new BoardBuilder(15, 16, board);
    }).toThrow('same size as the new board');
});
