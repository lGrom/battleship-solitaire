import { RELATIVE_POSITIONS } from './BoardBuilder';

/**
 * The ship class for the board
 */
export default class Ship {
    playType;
    graphicalType;

    /**
     * @param {Number} type - The play or graphical type of the ship
     * @param {boolean} [pinned] - Should the Ship's type change (used for presets)
     */
    constructor (type, pinned) {
        // sets the play and graphical types
        this.setGraphicalType(type);
        this.pinned = pinned || false;
    }

    toString () {
        switch (this.graphicalType) {
        case GRAPHICAL_TYPES.UKNOWN:
            return 'Uknown';
        case GRAPHICAL_TYPES.WATER:
            return 'Water';
        case GRAPHICAL_TYPES.SHIP:
            return 'Ship';
        case GRAPHICAL_TYPES.DOWN:
            return 'Down';
        case GRAPHICAL_TYPES.HORIZONTAL:
            return 'Horizontal';
        case GRAPHICAL_TYPES.LEFT:
            return 'Left';
        case GRAPHICAL_TYPES.RIGHT:
            return 'Right';
        case GRAPHICAL_TYPES.SINGLE:
            return 'Single';
        case GRAPHICAL_TYPES.UP:
            return 'Up';
        case GRAPHICAL_TYPES.VERTICAL:
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

        if (this.graphicalType < GRAPHICAL_TYPES.SHIP || newType < GRAPHICAL_TYPES.SHIP) this.setGraphicalType(newType);

        this.playType = newType;
        return this;
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    setGraphicalType (newType) {
        if (!Object.values(GRAPHICAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a graphical type');

        if (newType < PLAY_TYPES.SHIP) this.playType = newType;
        else if (newType > PLAY_TYPES.SHIP) this.playType = PLAY_TYPES.SHIP;

        this.graphicalType = newType;
        return this;
    }

    /**
     * @returns {Boolean} true if ship is left, right, up, or down
     */
    isUnidirectional () {
        return [GRAPHICAL_TYPES.LEFT, GRAPHICAL_TYPES.RIGHT, GRAPHICAL_TYPES.UP, GRAPHICAL_TYPES.DOWN].includes(this.graphicalType);
    }

    /**
     * @returns {Boolean} true if ship is horizontal or vertical
     */
    isBidirectional () {
        return [GRAPHICAL_TYPES.HORIZONTAL, GRAPHICAL_TYPES.VERTICAL].includes(this.graphicalType);
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

    static graphicalTypeToRelativePosition (graphicalType) {
        switch (graphicalType) {
        case GRAPHICAL_TYPES.LEFT:
            return RELATIVE_POSITIONS.LEFT;
        case GRAPHICAL_TYPES.RIGHT:
            return RELATIVE_POSITIONS.RIGHT;
        case GRAPHICAL_TYPES.UP:
            return RELATIVE_POSITIONS.TOP;
        case GRAPHICAL_TYPES.DOWN:
            return RELATIVE_POSITIONS.BOTTOM;
        default:
            throw new Error(`${graphicalType} has no single corresponding relative position`);
        }
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
 * Not required for gameplay; purely for visual effect
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
    LEFT: 7,

    VERTICAL: 8,
    HORIZONTAL: 9
};
