import Board from "./Board";
import { PLAY_TYPES, Ship } from "./Ship";

test('board dimensions', () => {
    expect(new Board({ width: 8, height: 8 }).dimensions).toEqual([8, 8]);
    expect(() => { new Board({ width: 4, height: 0 }) }).toThrow('Invalid input');
    expect(() => { new Board({ width: -2, height: 5 }) }).toThrow('Invalid input');
    expect(() => { new Board({ width: 3.14, height: 5 }) }).toThrow('Invalid input');
    expect(() => { new Board({ width: '4', height: 5 }) }).toThrow('Invalid input');
})

test('coordinatesToIndex', () => {
    expect(() => { new Board().coordinatesToIndex([5, 7]) }).toThrow('Invalid input');
    expect(() => { new Board({ width: 8, height: 8 }).coordinatesToIndex([5, 7.2]) }).toThrow('Invalid input');
    expect(() => { new Board({ width: 8, height: 8 }).coordinatesToIndex([5.6, 7.2]) }).toThrow('Invalid input');
    expect(() => { new Board({ width: 8, height: 8 }).coordinatesToIndex([5.6, 7]) }).toThrow('Invalid input');
    expect(new Board({ width: 8, height: 8 }).coordinatesToIndex([5, 7])).toBe(52);
});

test('setShip', () => {
    const board = new Board({ width: 8, height: 8 });
    const ship = new Ship(PLAY_TYPES.WATER);
    board.setShip([1, 4], ship);

    expect(board.state.board[board.coordinatesToIndex([1, 4])]).toEqual(ship);
})

test('getShip', () => {
    const board = new Board({ width: 4, height: 4 });
    const ship = new Ship(PLAY_TYPES.UKNOWN);

    expect(board.getShip([1, 2])).toEqual(ship);
    expect(board.getShip(0)).toEqual(ship);
    
    expect(() => { board.getShip(-1)}).toThrow('')
    expect(() => { board.getShip([5, 4])}).toThrow('')
})