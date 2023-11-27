import { Board, RelativePositions } from "./Board";
import { Ship, PLAY_TYPES } from "./Ship";

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

test('setRelativeShip', () => {
    const board = new Board({ width: 4, height: 4 });
    const ship = new Ship(PLAY_TYPES.SHIP);

    expect(board.setRelativeShip([2, 3], RelativePositions.TOP_LEFT, ship).getShip([1, 2])).toBe(Ship);
    expect(board.setRelativeShip([2, 3], RelativePositions.RIGHT, ship).getShip([3, 3])).toBe(Ship);
    expect(board.setRelativeShip([2, 3], RelativePositions.BOTTOM, ship).getShip([2, 4])).toBe(Ship);
})

test('getRelativeShip', () => {
    const board1 = new Board({ width: 4, height: 4 });
    const board2 = new Board({ width: 4, height: 4 });
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);

    board1.setShip([3, 1], ship1);
    board2.setShip([3, 3], ship2);

    expect(board1.getRelativeShip([2, 2], RelativePositions.TOP_RIGHT)).toBe(ship1);
    expect(board2.getRelativeShip([2, 2], RelativePositions.BOTTOM_RIGHT)).toBe(ship2);

    expect(board1.getRelativeShip([1, 1], RelativePositions.TOP)).toBeNull();
    expect(board1.getRelativeShip([1, 4], RelativePositions.BOTTOM)).toBeNull();
})