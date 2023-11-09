import Board from "./Board";
import { PLAY_TYPES, Ship } from "./Ship";

test('board dimensions', () => {
    expect(new Board({ dimensions: [8, 8] }).dimensions).toEqual([8, 8]);
    expect(new Board().dimensions).toEqual([4, 4])
    expect(() => { new Board({ dimensions: [4, 0] }).dimensions }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: [-2, 6] }).dimensions }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: [3.14, 5] }).dimensions }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: ['4', 5] }).dimensions }).toThrow('Invalid input');
})

test('coordinatesToIndex', () => {
    expect(() => { new Board().coordinatesToIndex([5, 7]) }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: [8, 8] }).coordinatesToIndex([5, 7.2]) }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: [8, 8] }).coordinatesToIndex([5.6, 7.2]) }).toThrow('Invalid input');
    expect(() => { new Board({ dimensions: [8, 8] }).coordinatesToIndex([5.6, 7]) }).toThrow('Invalid input');
    expect(new Board({ dimensions: [8, 8] }).coordinatesToIndex([5, 7])).toBe(52);
});

test('setShip', () => {
    const board = new Board({ dimensions: [8, 8] });
    const ship = new Ship(PLAY_TYPES.WATER);
    board.setShip([1, 4], ship);

    expect(board.state.board[board.coordinatesToIndex([1, 4])]).toEqual(ship);
})

test('getShip', () => {
    const ship = new Ship(PLAY_TYPES.UKNOWN);
    expect(new Board({ dimensions: [8, 8] }).getShip([5, 7])).toEqual(ship);
})