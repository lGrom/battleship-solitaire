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