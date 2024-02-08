/**
 * The ship class for the board
 * @param {Number} type - The play, graphical, or internal type of the ship
 */
export default class Ship {
    playType;
    graphicalType;
    internalType;

    constructor (type) {
        // sets the play and graphical types
        this.setInternalType(type);
    }

    toString () {
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
    setPlayType (newType) {
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
    setGraphicalType (newType) {
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
    setInternalType (newType) {
        if (!Object.values(INTERNAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a internal type');

        if (newType < INTERNAL_TYPES.SHIP) this.graphicalType = newType;
        else if (newType < INTERNAL_TYPES.VERTICAL) this.graphicalType = newType;
        else if (newType >= INTERNAL_TYPES.VERTICAL) this.graphicalType = GRAPHICAL_TYPES.SHIP;

        if (newType < INTERNAL_TYPES.SHIP) this.playType = newType;
        else this.playType = PLAY_TYPES.SHIP;

        this.internalType = newType;
        return this;
    }

    /**
     * Returns true if all provided squares are a certain type
     * @param {Ship | Ship[]} squares
     * @param {number} type
     * @returns
     */
    static isPlayType (squares, type) {
        if (Array.isArray(squares)) {
            for (const square of squares) {
                if (square.playType !== type) return false;
            }

            return true;
        } else {
            return squares.playType === type;
        }
    }

    static isWater (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.WATER);
    }

    static isShips (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.SHIP);
    }

    static isUnkown (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.UKNOWN);
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
