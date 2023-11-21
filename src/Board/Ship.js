/* eslint-disable no-unused-expressions */
export class Ship {
    playType;
    graphicalType;
    internalType;

    constructor (playType, graphicalType, internalType) {
        this.playType = playType;
        this.graphicalType = graphicalType || this.playType;
        this.internalType = internalType || this.playType;
    }

    toString() {
        switch (this.graphicalType) {
            case 0:
                return 'Uknown';
            case 1:
                return 'Water';
            case 2:
                return 'Ship';
            default:
                return this.graphicalType
        }
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    changePlayType (newType) {
        if (!Object.values(PLAY_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a play type');
        
        if (this.graphicalType < GRAPHICAL_TYPES.SHIP) this.changeGraphicalType(newType);
        else if (newType < GRAPHICAL_TYPES.SHIP) this.changeGraphicalType(newType);

        this.playType = newType;
        return this;
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    changeGraphicalType (newType) {
        if (!Object.values(GRAPHICAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a graphical type');

        if (this.internalType < INTERNAL_TYPES.SHIP) this.changeInternalType(newType);
        else if (newType < INTERNAL_TYPES.VERTICAL)  this.changeInternalType(newType);

        if (newType < PLAY_TYPES.SHIP) this.playType = newType;
        else if (newType > PLAY_TYPES.SHIP) this.playType = PLAY_TYPES.SHIP;

        this.graphicalType = newType;
        return this;
    }

    /**
     * @param {Number} newType
     * @returns {Ship} this
     */
    changeInternalType (newType) {
        if (!Object.values(INTERNAL_TYPES).includes(newType)) throw new Error('Invalid input: newType must be a internal type');
        
        if (newType < GRAPHICAL_TYPES.SHIP) this.graphicalType = newType;
        else if (newType < INTERNAL_TYPES.VERTICAL) this.graphicalType = newType;
        else if (newType >= INTERNAL_TYPES.VERTICAL) this.graphicalType = GRAPHICAL_TYPES.SHIP;
        
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
    SHIP: 2,
}

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
    LEFT: 7,
}

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
    HORIZONTAL: 9,
}