import { RELATIVE_POSITIONS } from './BoardBuilder';
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';

test('toString', () => {
    for(const type in GRAPHICAL_TYPES) {
        const ship = new Ship(GRAPHICAL_TYPES[type]);
        expect(ship.toString().toUpperCase()).toBe(type);
    }

    const ship = new Ship(GRAPHICAL_TYPES.UNKNOWN);
    ship.graphicalType = 10;

    expect(() => { ship.toString(); }).toThrow('graphicalType is not a valid graphical type');
});

test('setPlayType', () => {
    const ship = new Ship(PLAY_TYPES.UNKNOWN);

    expect(() => { ship.setPlayType(GRAPHICAL_TYPES.HORIZONTAL); }).toThrow('newType must be a play type');

    ship.setPlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(PLAY_TYPES.SHIP);

    ship.setGraphicalType(GRAPHICAL_TYPES.HORIZONTAL);
    ship.setPlayType(PLAY_TYPES.SHIP);
    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.HORIZONTAL);

    expect(ship.playType).toBe(PLAY_TYPES.SHIP);
    expect(ship.setPlayType(PLAY_TYPES.WATER) instanceof Ship).toBeTruthy();
});

test('setGraphicalType', () => {
    const ship = new Ship(GRAPHICAL_TYPES.HORIZONTAL);

    expect(() => { ship.setGraphicalType(20); }).toThrow('newType must be a graphical type');

    ship.setGraphicalType(GRAPHICAL_TYPES.WATER);
    expect(ship.playType).toBe(PLAY_TYPES.WATER);

    ship.setGraphicalType(GRAPHICAL_TYPES.VERTICAL);
    expect(ship.playType).toBe(PLAY_TYPES.SHIP);

    expect(ship.graphicalType).toBe(GRAPHICAL_TYPES.VERTICAL);
    expect(ship.setGraphicalType(GRAPHICAL_TYPES.RIGHT) instanceof Ship).toBeTruthy();
});

test('equals', () => {
    const ship1 = new Ship(GRAPHICAL_TYPES.HORIZONTAL);
    const ship2 = new Ship(GRAPHICAL_TYPES.HORIZONTAL);
    const ship3 = new Ship(GRAPHICAL_TYPES.LEFT);

    expect(ship1.equals(ship2)).toBeTruthy();
    expect(ship1.equals(ship3)).toBeFalsy();
    expect(ship3.equals(ship1)).toBeFalsy();
    expect(ship3.equals(ship2)).toBeFalsy();
});

test('isCardinal', () => {
    const left = new Ship(GRAPHICAL_TYPES.LEFT);
    const up = new Ship(GRAPHICAL_TYPES.DOWN);
    const horiztonal = new Ship(GRAPHICAL_TYPES.HORIZONTAL);
    const ship = new Ship(GRAPHICAL_TYPES.SHIP);

    expect(left.isCardinal()).toBeTruthy();
    expect(up.isCardinal()).toBeTruthy();
    expect(horiztonal.isCardinal()).toBeFalsy();
    expect(ship.isCardinal()).toBeFalsy();
});

test('isOrthogonal', () => {
    const left = new Ship(GRAPHICAL_TYPES.LEFT);
    const up = new Ship(GRAPHICAL_TYPES.DOWN);
    const horiztonal = new Ship(GRAPHICAL_TYPES.HORIZONTAL);
    const vertical = new Ship(GRAPHICAL_TYPES.VERTICAL);
    const ship = new Ship(GRAPHICAL_TYPES.SHIP);

    expect(left.isOrthogonal()).toBeFalsy();
    expect(up.isOrthogonal()).toBeFalsy();
    expect(horiztonal.isOrthogonal()).toBeTruthy();
    expect(vertical.isOrthogonal()).toBeTruthy();
    expect(ship.isOrthogonal()).toBeFalsy();
});

test('isEnd', () => {
    const left = new Ship(GRAPHICAL_TYPES.LEFT);
    const up = new Ship(GRAPHICAL_TYPES.DOWN);
    const single = new Ship(GRAPHICAL_TYPES.SINGLE);
    const horiztonal = new Ship(GRAPHICAL_TYPES.HORIZONTAL);
    const ship = new Ship(GRAPHICAL_TYPES.SHIP);

    expect(left.isEnd()).toBeTruthy();
    expect(up.isEnd()).toBeTruthy();
    expect(single.isEnd()).toBeTruthy();
    expect(horiztonal.isEnd()).toBeFalsy();
    expect(ship.isEnd()).toBeFalsy();
});

test('isPlayType', () => {
    const comparate1 = PLAY_TYPES.SHIP;
    const comparate2 = PLAY_TYPES.WATER;
    const comparate3 = PLAY_TYPES.UNKNOWN;

    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);
    const ship3 = new Ship(PLAY_TYPES.UNKNOWN);
    const ship4 = new Ship(PLAY_TYPES.SHIP);

    const combo1 = [ship1, ship2, ship3];
    const combo2 = [ship1, ship4];
    const combo3 = [ship2, ship3, ship4];

    expect(Ship.isPlayType(ship1, comparate1)).toBeTruthy();
    expect(Ship.isPlayType(ship1, comparate2)).toBeFalsy();
    expect(Ship.isPlayType(ship2, comparate1)).toBeFalsy();
    expect(Ship.isPlayType(ship2, comparate2)).toBeTruthy();
    expect(Ship.isPlayType(ship3, comparate3)).toBeTruthy();
    expect(Ship.isPlayType(ship3, comparate1)).toBeFalsy();

    expect(Ship.isPlayType(combo1, comparate1)).toBeFalsy();
    expect(Ship.isPlayType(combo1, comparate2)).toBeFalsy();
    expect(Ship.isPlayType(combo2, comparate1)).toBeTruthy();
    expect(Ship.isPlayType(combo2, comparate3)).toBeFalsy();
    expect(Ship.isPlayType(combo3, comparate2)).toBeFalsy();
    expect(Ship.isPlayType(combo3, comparate3)).toBeFalsy();
});

test('isWater', () => {
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);
    const ship3 = new Ship(PLAY_TYPES.UNKNOWN);

    expect(Ship.isWater(ship1)).toBeFalsy();
    expect(Ship.isWater(ship2)).toBeTruthy();
    expect(Ship.isWater(ship3)).toBeFalsy();
});

test('isShip', () => {
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);
    const ship3 = new Ship(PLAY_TYPES.UNKNOWN);

    expect(Ship.isShip(ship1)).toBeTruthy();
    expect(Ship.isShip(ship2)).toBeFalsy();
    expect(Ship.isShip(ship3)).toBeFalsy();
});

test('isUnknown', () => {
    const ship1 = new Ship(PLAY_TYPES.SHIP);
    const ship2 = new Ship(PLAY_TYPES.WATER);
    const ship3 = new Ship(PLAY_TYPES.UNKNOWN);

    expect(Ship.isUnknown(ship1)).toBeFalsy();
    expect(Ship.isUnknown(ship2)).toBeFalsy();
    expect(Ship.isUnknown(ship3)).toBeTruthy();
});

test('graphicalTypeToRelativePosition', () => {
    const ship1 = GRAPHICAL_TYPES.LEFT;
    const ship2 = GRAPHICAL_TYPES.RIGHT;
    const ship3 = GRAPHICAL_TYPES.UP;
    const ship4 = GRAPHICAL_TYPES.DOWN;
    const ship5 = GRAPHICAL_TYPES.HORIZONTAL;
    const ship6 = PLAY_TYPES.SHIP;

    expect(Ship.graphicalTypeToRelativePosition(ship1)).toBe(RELATIVE_POSITIONS.LEFT);
    expect(Ship.graphicalTypeToRelativePosition(ship2)).toBe(RELATIVE_POSITIONS.RIGHT);
    expect(Ship.graphicalTypeToRelativePosition(ship3)).toBe(RELATIVE_POSITIONS.TOP);
    expect(Ship.graphicalTypeToRelativePosition(ship4)).toBe(RELATIVE_POSITIONS.BOTTOM);

    expect(() => { Ship.graphicalTypeToRelativePosition(ship5); }).toThrow('has no single corresponding relative position');
    expect(() => { Ship.graphicalTypeToRelativePosition(ship6); }).toThrow('has no single corresponding relative position');
});

test('doesn\'t delete attributes', () => {
    expect(new Ship(PLAY_TYPES.SHIP).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.WATER).playType).toBeDefined();
    expect(new Ship(PLAY_TYPES.UNKNOWN).playType).toBeDefined();
});
