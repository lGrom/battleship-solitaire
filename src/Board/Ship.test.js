/* eslint-disable no-undef */
import Ship, { GRAPHICAL_TYPES, INTERNAL_TYPES, PLAY_TYPES } from './Ship';

test('set types', () => {
    // play types
    expect(new Ship(PLAY_TYPES.UKNOWN).setPlayType(PLAY_TYPES.WATER).playType).toBe(PLAY_TYPES.WATER);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).setPlayType(GRAPHICAL_TYPES.UP);
    }).toThrow('Invalid input');

    // graphical types
    expect(new Ship(PLAY_TYPES.UKNOWN).setGraphicalType(GRAPHICAL_TYPES.LEFT).graphicalType).toBe(GRAPHICAL_TYPES.LEFT);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).setGraphicalType(INTERNAL_TYPES.VERTICAL);
    }).toThrow('Invalid input');

    // internal types
    expect(new Ship(PLAY_TYPES.UKNOWN).setInternalType(INTERNAL_TYPES.HORIZONTAL).internalType).toBe(INTERNAL_TYPES.HORIZONTAL);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).setInternalType(10);
    }).toThrow('Invalid input');
});

test('set types propogation', () => {
    const ship = new Ship(PLAY_TYPES.UKNOWN);

    ship.setPlayType(PLAY_TYPES.WATER);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.WATER);
    expect(ship.internalType).toBe(INTERNAL_TYPES.WATER);

    ship.setPlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);
    expect(ship.internalType).toBe(INTERNAL_TYPES.SHIP);

    ship.setGraphicalType(GRAPHICAL_TYPES.LEFT);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);
    expect(ship.internalType).toBe(INTERNAL_TYPES.LEFT);

    ship.setGraphicalType(PLAY_TYPES.WATER);
    expect(ship.playType).toBe(PLAY_TYPES.WATER);
    expect(ship.internalType).toBe(INTERNAL_TYPES.WATER);

    ship.setInternalType(INTERNAL_TYPES.VERTICAL);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);

    ship.setInternalType(INTERNAL_TYPES.UKNOWN);
    expect(ship.playType).toBe(PLAY_TYPES.UKNOWN);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.UKNOWN);
});
