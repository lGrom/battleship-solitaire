import { GRAPHICAL_TYPES, INTERNAL_TYPES, PLAY_TYPES, Ship } from "./Ship"

test('change types', () => {
    // play types
    expect(new Ship(PLAY_TYPES.UKNOWN).changePlayType(PLAY_TYPES.WATER).playType).toBe(PLAY_TYPES.WATER);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).changePlayType(GRAPHICAL_TYPES.UP);
    }).toThrow('Invalid input');

    // graphical types
    expect(new Ship(PLAY_TYPES.UKNOWN).changeGraphicalType(GRAPHICAL_TYPES.LEFT).graphicalType).toBe(GRAPHICAL_TYPES.LEFT);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).changeGraphicalType(INTERNAL_TYPES.VERTICAL);
    }).toThrow('Invalid input');

    // internal types
    expect(new Ship(PLAY_TYPES.UKNOWN).changeInternalType(INTERNAL_TYPES.HORIZONTAL).internalType).toBe(INTERNAL_TYPES.HORIZONTAL);
    expect(() => {
        new Ship(PLAY_TYPES.UKNOWN).changeInternalType(10);
    }).toThrow('Invalid input');
})

test('change types propogation', () => {
    const ship = new Ship(PLAY_TYPES.UKNOWN);

    ship.changePlayType(PLAY_TYPES.WATER);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.WATER);
    expect(ship.internalType).toBe(INTERNAL_TYPES.WATER);

    ship.changePlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);
    expect(ship.internalType).toBe(INTERNAL_TYPES.SHIP);

    ship.changeGraphicalType(GRAPHICAL_TYPES.LEFT);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);
    expect(ship.internalType).toBe(INTERNAL_TYPES.LEFT);

    ship.changeGraphicalType(PLAY_TYPES.WATER);
    expect(ship.playType).toBe(PLAY_TYPES.WATER);
    expect(ship.internalType).toBe(INTERNAL_TYPES.WATER);

    ship.changeInternalType(INTERNAL_TYPES.VERTICAL);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.SHIP);

    ship.changeInternalType(INTERNAL_TYPES.UKNOWN);
    expect(ship.playType).toBe(PLAY_TYPES.UKNOWN);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.UKNOWN);
})