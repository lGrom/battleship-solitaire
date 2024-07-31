/* eslint-disable no-undef */
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';

test('set types', () => {
    // play types
    expect(new Ship(PLAY_TYPES.UNKNOWN).setPlayType(PLAY_TYPES.WATER).playType).toBe(PLAY_TYPES.WATER);
    expect(() => { new Ship(PLAY_TYPES.UNKNOWN).setPlayType(GRAPHICAL_TYPES.UP); }).toThrow('must be a play type');

    // graphical types
    expect(new Ship(PLAY_TYPES.UNKNOWN).setGraphicalType(GRAPHICAL_TYPES.LEFT).graphicalType).toBe(GRAPHICAL_TYPES.LEFT);
    expect(() => { new Ship(PLAY_TYPES.UNKNOWN).setGraphicalType(10); }).toThrow('must be a graphical type');
});

test('set types propogation', () => {
    const ship = new Ship(PLAY_TYPES.UNKNOWN);

    ship.setPlayType(PLAY_TYPES.WATER);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.WATER);

    ship.setPlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);

    ship.setGraphicalType(GRAPHICAL_TYPES.LEFT);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);

    ship.setGraphicalType(PLAY_TYPES.WATER);
    expect(ship.playType).toBe(PLAY_TYPES.WATER);
});

test('doesn\'t delete attributes', () => {
    expect(new Ship(PLAY_TYPES.SHIP).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.WATER).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.UNKNOWN).playType).toBeDefined();
});
