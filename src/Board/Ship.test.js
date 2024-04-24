/* eslint-disable no-undef */
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';

test('set types', () => {
    // play types
    expect(new Ship(PLAY_TYPES.UKNOWN).setPlayType(PLAY_TYPES.WATER).playType).toBe(PLAY_TYPES.WATER);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).setPlayType(GRAPHICAL_TYPES.UP);
    }).toThrow('Invalid input');

    // graphical types
    expect(new Ship(PLAY_TYPES.UKNOWN).setGraphicalType(GRAPHICAL_TYPES.LEFT).graphicalType).toBe(GRAPHICAL_TYPES.LEFT);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).setGraphicalType(10);
    }).toThrow('Invalid input');
});

test('set types propogation', () => {
    const ship = new Ship(PLAY_TYPES.UKNOWN);

    ship.setPlayType(PLAY_TYPES.WATER);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.WATER);

    ship.setPlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);

    ship.setGraphicalType(GRAPHICAL_TYPES.LEFT);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);

    ship.setGraphicalType(PLAY_TYPES.WATER);
    expect(ship.playType).toBe(PLAY_TYPES.WATER);
});

// this really shouldn't need to be here (but it does need to be here)
// any time you make a ship with the ship type it removes the playtype for some reason
test('doesn\'t delete attributes', () => {
    expect(new Ship(PLAY_TYPES.SHIP).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.WATER).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.UKNOWN).playType).toBeDefined();
});
