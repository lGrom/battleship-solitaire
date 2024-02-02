/**
 * The ship class for the board
 * @param {Number} type - The play, graphical, or internal type of the ship
 */
export default class Ship {
    playType;
    graphicalType;
    internalType;

    constructor(type) {
        // determine if it's a play, graphical, or internal type and use the respective function
        if (type <= PLAY_TYPES.SHIP) this.setPlayType(type);
        else if (type <= GRAPHICAL_TYPES.LEFT) this.setGraphicalType(type);
        else if (type <= INTERNAL_TYPES.HORIZONTAL) this.setInternalType(type);
        else throw new Error('type should be a play, graphical, or internal type');
    }

    toString() {
        switch (this.internalType) {
            case INTERNAL_TYPES.UKNOWN:
                return 'Uknown';
            case INTERNAL_TYPES.WATER:
                return 'Water';
            case INTERNAL_TYPES.SHIP:
                return 'Ship';
            case INTERNAL_TYPES.DOWN:
                return 'Down';
            case INTERNAL_TYPES.HORIZONTAL:
                return 'Horizontal';
            case INTERNAL_TYPES.LEFT:
                return 'Left';
            case INTERNAL_TYPES.RIGHT:
                return 'Right';
            case INTERNAL_TYPES.SINGLE:
                return 'Single';
            case INTERNAL_TYPES.UP:
                return 'Up';
            case INTERNAL_TYPES.VERTICAL:
                return 'Vertical';
            default:
                return this.playType;
        }
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    setPlayType(newType) {
        if (!Object.values(PLAY_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a play type');

        if (this.graphicalType < GRAPHICAL_TYPES.SHIP) this.setGraphicalType(newType);
        else if (newType < GRAPHICAL_TYPES.SHIP) this.setGraphicalType(newType);

        this.playType = newType;
        return this;
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    setGraphicalType(newType) {
        if (!Object.values(GRAPHICAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a graphical type');

        if (this.internalType < INTERNAL_TYPES.SHIP) this.setInternalType(newType);
        else if (newType < INTERNAL_TYPES.VERTICAL) this.setInternalType(newType);

        if (newType < PLAY_TYPES.SHIP) this.playType = newType;
        else if (newType > PLAY_TYPES.SHIP) this.playType = PLAY_TYPES.SHIP;

        this.graphicalType = newType;
        return this;
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    setInternalType(newType) {
        if (!Object.values(INTERNAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a internal type');

        if (newType < INTERNAL_TYPES.SHIP) this.graphicalType = newType;
        else if (newType < INTERNAL_TYPES.VERTICAL) this.graphicalType = newType;
        else if (newType >= INTERNAL_TYPES.VERTICAL) this.graphicalType = GRAPHICAL_TYPES.SHIP;

        if (newType < INTERNAL_TYPES.SHIP) this.playType = newType;
        else this.playType = PLAY_TYPES.SHIP;

        this.internalType = newType;
        return this;
    }
}

/**
 * Controlled by the player; required for gameplay
 * @constant
 */
export const PLAY_TYPES = {
    // playable/basics
    UKNOWN: 0,
    WATER: 1,
    SHIP: 2
};

/**
 * Not required for gameplay; purely for visual effect\
 * @constant
 */
export const GRAPHICAL_TYPES = {
    UKNOWN: 0,
    WATER: 1,

    // ships
    SHIP: 2,
    SINGLE: 3,
    UP: 4,
    RIGHT: 5,
    DOWN: 6,
    LEFT: 7
};

/**
 * Cannot be seen nor interacted with; used in solving
 * @constant
 */
export const INTERNAL_TYPES = {
    UKNOWN: 0,
    WATER: 1,

    // ships
    SHIP: 2,
    SINGLE: 3,
    UP: 4,
    RIGHT: 5,
    DOWN: 6,
    LEFT: 7,

    // unique from graphical types
    VERTICAL: 8,
    HORIZONTAL: 9
};
