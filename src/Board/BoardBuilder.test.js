/* eslint-disable no-undef */
import BoardBuilder, { RELATIVE_POSITIONS } from './BoardBuilder';
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';
import { act } from 'react';

test('board dimensions', () => {
    expect(new BoardBuilder(8, 8).width).toEqual(8);
    expect(new BoardBuilder(8, 8).height).toEqual(8);
});

test('pre-existing ships', () => {
    const preset = new BoardBuilder(4, 4).setShip([2, 3], new Ship(PLAY_TYPES.SHIP)).setShip([1, 1], new Ship(PLAY_TYPES.WATER));
    expect(new BoardBuilder(4, 4, preset).boardState[0]).toStrictEqual(new Ship(PLAY_TYPES.WATER));
    expect(new BoardBuilder(4, 4, preset).boardState[9]).toStrictEqual(new Ship(PLAY_TYPES.SHIP));
});

test('coordinatesToIndex', () => {
    expect(() => { new BoardBuilder().coordinatesToIndex([5, 7]); }).toThrow('Invalid input');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([5, 7.2]); }).toThrow('Invalid input');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([5.6, 7.2]); }).toThrow('Invalid input');
    expect(() => { new BoardBuilder(8, 8).coordinatesToIndex([5.6, 7]); }).toThrow('Invalid input');
    expect(new BoardBuilder(8, 8).coordinatesToIndex([5, 7])).toBe(52);
    expect(new BoardBuilder(4, 4).coordinatesToIndex([1, 2])).toBe(4);
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
    const ship = new Ship(PLAY_TYPES.UKNOWN);

    expect(board.getShip([1, 2])).toEqual(ship);
    expect(board.getShip(0)).toEqual(ship);

    expect(() => { board.getShip(-1); }).toThrow('index');
    expect(() => { board.getShip([5, 4]); }).toThrow('coordinates');
});

test('relativePositionToIndex', () => {
    const board = new BoardBuilder(4, 4);

    expect(board.relativePositionToIndex([2, 3], RELATIVE_POSITIONS.RIGHT)).toBe(10);
    expect(board.relativePositionToIndex([2, 3], RELATIVE_POSITIONS.TOP_LEFT)).toBe(4);
    expect(board.relativePositionToIndex([2, 3], RELATIVE_POSITIONS.BOTTOM)).toBe(13);
});

test('setRelativeShip', () => {
    const board = new BoardBuilder(4, 4);
    const ship = new Ship(PLAY_TYPES.SHIP);

    expect(board.setRelativeShip([2, 3], RELATIVE_POSITIONS.TOP_LEFT, ship).getShip([1, 2])).toEqual(ship);
    expect(board.setRelativeShip([2, 3], RELATIVE_POSITIONS.RIGHT, ship).getShip([3, 3])).toEqual(ship);
    expect(board.setRelativeShip([2, 3], RELATIVE_POSITIONS.BOTTOM, ship).getShip([2, 4])).toEqual(ship);
});

test('getRelativeShip', () => {
    const board1 = new BoardBuilder(4, 4);
    const board2 = new BoardBuilder(4, 4);
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);

    board1.setShip([3, 1], ship1);
    board2.setShip([3, 3], ship2);

    expect(board1.getRelativeShip([2, 2], RELATIVE_POSITIONS.TOP_RIGHT)).toBe(ship1);
    expect(board2.getRelativeShip([2, 2], RELATIVE_POSITIONS.BOTTOM_RIGHT)).toBe(ship2);

    expect(board1.getRelativeShip([1, 1], RELATIVE_POSITIONS.TOP)).toBeNull();
    expect(board1.getRelativeShip([1, 4], RELATIVE_POSITIONS.BOTTOM)).toBeNull();
});

test('pinned ships', () => {
    const preset = new BoardBuilder(4, 4).setShip([2, 2], GRAPHICAL_TYPES.SINGLE, true);
    const board = new BoardBuilder(4, 4, preset);
    board.computeGraphicalTypes();

    expect(board.boardState).toEqual(preset.boardState);
});

test('copy', () => {
    const board = new BoardBuilder(4, 4).setShip([2, 2], GRAPHICAL_TYPES.SINGLE, true);
    const copy = board.copy();

    expect(copy).toEqual(board);

    // test for mutation
    copy.setShip([1, 1], PLAY_TYPES.SHIP);

    expect(copy).not.toEqual(board);
});

// test board state is equal
test('equals', () => {
    const board = new BoardBuilder(6, 6)
        .setShip([5, 4], GRAPHICAL_TYPES.SINGLE)
        .setShip([1, 6], PLAY_TYPES.WATER);
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
        .setShip([4, 5], GRAPHICAL_TYPES.SINGLE)
        .setShip([6, 1], PLAY_TYPES.WATER);

    expect(board.sameBoardState(diffBoard)).toBeFalsy();
    expect(board.sameBoardState(diffSizeBoard)).toBeFalsy();
    expect(board.sameBoardState(board)).toBeTruthy();
    expect(board.sameBoardState(sameBoard)).toBeTruthy();
});

test('count runs', () => {
    const board = BoardBuilder.solve(
        new BoardBuilder(15, 15, undefined, undefined,
            [0, 5, 6, 1, 5, 1, 5, 1, 0, 5, 3, 0, 2, 0, 1],
            [2, 0, 1, 3, 4, 2, 3, 2, 4, 0, 4, 3, 3, 2, 2])
            .setShip([4, 1], GRAPHICAL_TYPES.SHIP, true)
            .setShip([7, 1], GRAPHICAL_TYPES.WATER, true)
            .setShip([2, 3], GRAPHICAL_TYPES.WATER, true)
            .setShip([13, 3], GRAPHICAL_TYPES.SINGLE, true)
            .setShip([3, 4], GRAPHICAL_TYPES.LEFT, true)
            .setShip([6, 4], GRAPHICAL_TYPES.WATER, true)
            .setShip([11, 4], GRAPHICAL_TYPES.SHIP, true)
            .setShip([11, 5], GRAPHICAL_TYPES.VERTICAL, true)
            .setShip([13, 5], GRAPHICAL_TYPES.SINGLE, true)
            .setShip([3, 6], GRAPHICAL_TYPES.DOWN, true)
            .setShip([7, 7], GRAPHICAL_TYPES.SINGLE, true)
            .setShip([8, 7], GRAPHICAL_TYPES.WATER, true)
            .setShip([13, 7], GRAPHICAL_TYPES.WATER, true)
            .setShip([7, 8], GRAPHICAL_TYPES.WATER, true)
            .setShip([11, 8], GRAPHICAL_TYPES.WATER, true)
            .setShip([13, 8], GRAPHICAL_TYPES.WATER, true)
            .setShip([5, 9], GRAPHICAL_TYPES.SHIP, true)
            .setShip([10, 9], GRAPHICAL_TYPES.WATER, true)
            .setShip([3, 11], GRAPHICAL_TYPES.WATER, true)
            .setShip([7, 12], GRAPHICAL_TYPES.SHIP, true)
            .setShip([10, 12], GRAPHICAL_TYPES.SHIP, true)
            .setShip([15, 12], GRAPHICAL_TYPES.WATER, true)
            .setShip([3, 13], GRAPHICAL_TYPES.WATER, true)
            .setShip([4, 13], GRAPHICAL_TYPES.WATER, true)
            .setShip([8, 13], GRAPHICAL_TYPES.WATER, true)
            .setShip([10, 13], GRAPHICAL_TYPES.SHIP, true)
            .setShip([2, 14], GRAPHICAL_TYPES.UP, true)
            .setShip([7, 14], GRAPHICAL_TYPES.WATER, true)
            .setShip([4, 15], GRAPHICAL_TYPES.WATER, true)
            .setShip([15, 15], GRAPHICAL_TYPES.SINGLE, true)
            .computeGraphicalTypes()
    );

    const horizontalRuns = board.countHorizontalRuns();
    const verticalRuns = board.countVerticalRuns();

    expect(horizontalRuns[2].length).toEqual(4);
    expect(horizontalRuns[2].start).toEqual([5, 5]);
    expect(horizontalRuns[2].end).toEqual([8, 5]);
    expect(verticalRuns[7].length).toEqual(5);
    expect(verticalRuns[7].start).toEqual([10, 11]);
    expect(verticalRuns[7].end).toEqual([10, 15]);
});
