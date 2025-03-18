import { RELATIVE_POSITIONS } from './BoardBuilder';

/**
 * The ship class for the board
 * @param {number} type - The play or graphical type of the ship
 * @param {boolean} [pinned] - Should the Ship's type change (used for presets)
 * @property {number} playType - The play type of the ship
 * @property {number} graphicalType - The graphical type of the ship
 */
export default class Ship {
    playType;
    graphicalType;

    constructor (type, pinned) {
        // sets the play and graphical types
        this.setGraphicalType(type);
        this.pinned = pinned || false;
    }

    toString () {
        switch (this.graphicalType) {
        case GRAPHICAL_TYPES.UNKNOWN:
            return 'Unknown';
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
            throw new Error('graphicalType is not a valid graphical type');
        }
    }

    // -TODO make setPlayType not call setGraphicalType and update testing accordingly
    /**
     * Set the play type of the ship
     * @param {number} newType - The type to change it to
     * @returns {Ship} this
     * @throws {TypeError} If newType is not a play type
     */
    setPlayType (newType) {
        if (!Object.values(PLAY_TYPES).includes(newType)) throw new TypeError(`newType must be a play type (received: ${newType})`);

        if (this.graphicalType < GRAPHICAL_TYPES.SHIP || newType < GRAPHICAL_TYPES.SHIP) this.setGraphicalType(newType);

        this.playType = newType;
        return this;
    }

    /**
     * Set the graphical type of the ship
     * @param {number} newType - The type to change it to
     * @returns {Ship} this
     * @throws {TypeError} If newType is not a graphical type
     */
    setGraphicalType (newType) {
        if (!Object.values(GRAPHICAL_TYPES).includes(newType)) throw new TypeError(`newType must be a graphical type (received: ${newType})`);

        if (newType <= PLAY_TYPES.SHIP) this.playType = newType;
        else this.playType = PLAY_TYPES.SHIP;

        this.graphicalType = newType;
        return this;
    }

    /**
     * Use this instead of ===, doesn't check for pins
     * @param {Ship} comparate - The ship to compare with
     * @returns {boolean} true if equal, false if not
     */
    equals (comparate) {
        return (
            this.graphicalType === comparate.graphicalType
        );
    }

    /**
     * Checks if the ship is cardinal
     * @returns {boolean} true if ship is left, right, up, or down
     */
    isCardinal () {
        return [GRAPHICAL_TYPES.LEFT, GRAPHICAL_TYPES.RIGHT, GRAPHICAL_TYPES.UP, GRAPHICAL_TYPES.DOWN].includes(this.graphicalType);
    }

    /**
     * Checks if the ship is orthogonal
     * @returns {boolean} true if ship is horizontal or vertical
     */
    isOrthogonal () {
        return [GRAPHICAL_TYPES.HORIZONTAL, GRAPHICAL_TYPES.VERTICAL].includes(this.graphicalType);
    }

    /**
     * Checks if the ship is an end piece
     * @returns {boolean} true if ship is left, right, up, down, or single
     */
    isEnd () {
        return [GRAPHICAL_TYPES.LEFT, GRAPHICAL_TYPES.RIGHT, GRAPHICAL_TYPES.UP, GRAPHICAL_TYPES.DOWN, GRAPHICAL_TYPES.SINGLE].includes(this.graphicalType);
    }

    // -TODO make this use a spread argument instead of an array
    // so type first then all your arguments (but can still accept an array)
    /**
     * Returns true if all provided squares are a certain type
     * @param {Ship|Ship[]} squares - The square(s) to check
     * @param {number} type - The type to check the square(s) for
     * @returns {boolean} True if the square is the given play type
     */
    static isPlayType (squares, type) {
        if (Array.isArray(squares)) {
            for (const square of squares) {
                if (square.playType !== type) return false;
            }

            return true;
        }

        return squares.playType === type;
    }

    static isWater (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.WATER);
    }

    static isShip (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.SHIP);
    }

    static isUnknown (squares) {
        return Ship.isPlayType(squares, PLAY_TYPES.UNKNOWN);
    }

    // -TODO rename this
    /**
     * Convert a graphical type to its corresponding relative position
     * @param {number} graphicalType - The graphical type to convert
     * @returns {number} The corresponding relative position
     * @throws If there's no single corresponding relative position
     */
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
    UNKNOWN: 0,
    WATER: 1,
    SHIP: 2,
};

/**
 * Not required for gameplay; purely for visual effect
 * @constant
 */
export const GRAPHICAL_TYPES = {
    UNKNOWN: 0,
    WATER: 1,

    // ships
    SHIP: 2,
    SINGLE: 3,
    UP: 4,
    RIGHT: 5,
    DOWN: 6,
    LEFT: 7,

    VERTICAL: 8,
    HORIZONTAL: 9,
};
