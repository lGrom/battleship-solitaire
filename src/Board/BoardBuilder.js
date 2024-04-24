/* eslint-disable no-undef */
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship';

export default class BoardBuilder {
    /**
     * The underlying Board class. For use as a preset, supply width and height. For use as a puzzle, supply preset and either solution or verticalCount, horizontalCount, and shipsLeft.
     * @param {Number} width Width in squares
     * @param {Number} height Height in squares
     * @param {BoardBuilder} [preset] Pre-existing ships
     * @param {BoardBuilder} [solution] Ending board (leave undefined if using vert/hoz count and shipsLeft)
     * @param {Number[]} [columnCounts] Number of ships in each column (left to right)
     * @param {Number[]} [rowCounts] Number of ships in each row (top to bottom)
     * @param {Number[]} [shipsLeft] Number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
     */
    constructor (width, height, preset, solution, columnCounts, rowCounts, shipsLeft) {
        // if (preset) {
        //     if (solution) {
        //         // interpret everything else
        //     } else if (shipsLeft && columnCounts && rowCounts) {
        //         // interpret solution
        //         // note: this solution should not be used for checking if the puzzle is solved, as it may not be the only one
        //         // instead, create an isSolved() function to check if the board's state meets all criteria
        //     }

        //     // check viability
        // }

        this.width = width || preset?.width || 4;
        this.height = height || preset?.height || 4;

        this.columnCounts = columnCounts;
        this.rowCounts = rowCounts;
        this.boardState = createBoardState(this.width, this.height, preset);

        this.shipsLeft = shipsLeft;
    }

    /**
     * Copies the board without pointing to the origial
     * @returns {BoardBuilder} A copy of the board
     */
    copy () {
        return new BoardBuilder(this.width, this.height, this, this.solution, this.columnCounts, this.rowCounts, this.shipsLeft);
    }

    /**
     * Compares the board states of two boards
     * @param {BoardBuilder} comparate The board to compare with
     * @returns {Boolean} true if equal, false if not
     */
    sameBoardState (comparate) {
        if (this.height !== comparate.height || this.width !== comparate.width) return false;

        for (let i = 0; i < this.boardState.length; i++) {
            const ship = this.getShip(i);
            const comparateShip = comparate.getShip(i);

            if (!ship.equals(comparateShip)) return false;
        }

        return true;
    }

    // could be memoized, but it's unlikely to solve the same board multiple times (for now)
    // current problem: only iterates once before returning
    /**
     * Solves the board
     * @param {BoardBuilder} ogBoard The original board to solve
     * @param {BoardBuilder} [cache] The answer in progress
     * @param {Number} [iteration]
     * @returns {BoardBuilder} The solved board
     */
    static solve (ogBoard, cache, iteration) {
        // should be replaced in the future for an adjustable setting
        const ITERATION_LIMIT = 100;

        const tmpBoard = (cache) ? cache.copy() : ogBoard.copy();
        iteration ||= 1;

        /**
         * Count unkown and ship squares in a row
         * @param {number} y The row index (starts at 0)
         * @returns {number[]} [#ships, #unkown]
         */
        function countRow (y) {
            const counts = [0, 0];

            for (let x = 0; x < tmpBoard.width; x++) {
                const ship = tmpBoard.getShip([x + 1, y + 1]);

                if (ship.playType === PLAY_TYPES.SHIP) counts[0]++;
                if (ship.playType === PLAY_TYPES.UKNOWN) counts[1]++;
            }

            return counts;
        }

        /**
         * Count unkown and ship squares in a column
         * @param {number} y The column index (starts at 0)
         * @returns {number[]} [#ships, #unkown]
         */
        function countCol (x) {
            const counts = [0, 0];

            for (let y = 0; y < tmpBoard.height; y++) {
                const ship = tmpBoard.getShip([x + 1, y + 1]);

                if (ship.playType === PLAY_TYPES.SHIP) counts[0]++;
                if (ship.playType === PLAY_TYPES.UKNOWN) counts[1]++;
            }

            return counts;
        }

        // check for full or would-be-full rows/columns

        console.log('Pre rows:');
        console.log(tmpBoard);

        for (let y = 0; y < tmpBoard.height; y++) {
            const counts = countRow(y);
            const expected = tmpBoard.rowCounts[y];

            if (counts[0] === expected) tmpBoard.floodRow(y);
            if (counts[0] + counts[1] === expected) tmpBoard.floodRow(y, PLAY_TYPES.SHIP);
        }

        console.log('post');
        console.log(tmpBoard);

        for (let x = 0; x < tmpBoard.width; x++) {
            const counts = countCol(x);
            const expected = tmpBoard.columnCounts[x];

            if (counts[0] === expected) tmpBoard.floodColumn(x);
            if (counts[0] + counts[1] === expected) tmpBoard.floodColumn(x, PLAY_TYPES.SHIP); // somehow removes the ship's playtype
        }

        for (let i = 0; i < tmpBoard.boardState.length; i++) {
            const square = tmpBoard.getShip(i);

            if (square.playType !== PLAY_TYPES.SHIP) continue;

            if (square.isUnidirectional()) tmpBoard.setUnidirectionalWater(i, Ship.graphicalTypeToRelativePosition(square.graphicalType));
            else if (square.graphicalType === GRAPHICAL_TYPES.SINGLE) tmpBoard.setUnidirectionalWater(i, null); // makes every surrounding square water
            else if (square.isBidirectional()) tmpBoard.setBidirectionalWater(i, square.graphicalType);
        }

        // place water/ships around ships
        // "there's only one place it could go"
        // "there are multiple ways it could go, but they overlap"
        // just find everywhere it could go then combine possiblities with &&

        if (cache?.sameBoardState(tmpBoard) || iteration >= ITERATION_LIMIT) return tmpBoard.computeGraphicalTypes();
        else return BoardBuilder.solve(ogBoard, tmpBoard.computeGraphicalTypes(), ++iteration);
    }

    // consistency in syntax and whatnot could use some work here
    computeGraphicalTypes () {
        const board = this.boardState;

        for (let i = 0; i < board.length; i++) {
            if (board[i].pinned) continue;

            // for legiability
            const [isShip, isUnkown, isWater] = [Ship.isShip, Ship.isUnkown, Ship.isWater];

            if (!isShip(board[i])) continue;

            function setType (type) {
                board[i].setGraphicalType(type);
            }

            // makes the edges act as water
            const left = this.getRelativeShip(i, RELATIVE_POSITIONS.LEFT) || new Ship(PLAY_TYPES.WATER);
            const top = this.getRelativeShip(i, RELATIVE_POSITIONS.TOP) || new Ship(PLAY_TYPES.WATER);
            const right = this.getRelativeShip(i, RELATIVE_POSITIONS.RIGHT) || new Ship(PLAY_TYPES.WATER);
            const bottom = this.getRelativeShip(i, RELATIVE_POSITIONS.BOTTOM) || new Ship(PLAY_TYPES.WATER);

            // now just do all the logic from here and have a grand ol' time
            if (isWater([left, top, right, bottom])) setType(GRAPHICAL_TYPES.SINGLE);
            else if (
                isShip([left, right]) ||
                (isShip(left) && isUnkown(right)) ||
                (isShip(right && isUnkown(left)))) setType(GRAPHICAL_TYPES.HORIZONTAL);
            else if (
                isShip([top, bottom]) ||
                (isShip(top) && isUnkown(bottom)) ||
                (isShip(bottom) && isUnkown(top))) setType(GRAPHICAL_TYPES.VERTICAL);

            // else if (isShip(left) && )
            else if (isShip(left) && isWater(right)) setType(GRAPHICAL_TYPES.LEFT);
            else if (isShip(top) && isWater(bottom)) setType(GRAPHICAL_TYPES.UP);
            else if (isShip(right) && isWater(left)) setType(GRAPHICAL_TYPES.RIGHT);
            else if (isShip(bottom) && isWater(top)) setType(GRAPHICAL_TYPES.DOWN);
        }

        return this;
    }

    /**
     * @param {Array<Number>} coordinates - An array starting at 1 as [x, y]
     * @returns {Number}
     */
    coordinatesToIndex (coordinates) {
        const [x, y] = coordinates;

        if (x > this.width || y > this.height) {
            throw new Error('Invalid input: coordinates must not exceed board dimensions');
        }

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Invalid input: coordinates must be integers');
        }

        // paranthesis for legability
        return ((y - 1) * this.width) + (x - 1);
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @returns {Number}
     */
    positionToIndex (position) {
        if (typeof position === 'number' && position >= 0) return position;
        if (Array.isArray(position)) return this.coordinatesToIndex(position);
        throw new Error('Invalid input: position must be an index or array of coordinates');
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @returns {Ship}
     */
    getShip (position) {
        const index = this.positionToIndex(position);
        return this.boardState[index];
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only works if value is a ship type)
     * @returns {BoardBuild} this
     */
    setShip (position, value, pinned) {
        const index = this.positionToIndex(position);

        let ship = value;

        if (value instanceof Ship);
        else if (typeof value === 'number') ship = new Ship(value, pinned); // why does this strip play types
        else throw new Error('value should be an instance of Ship or a ship type');

        const tmpBoard = this.copy();
        tmpBoard.boardState[index] = ship;
        this.boardState = tmpBoard.copy().boardState;

        return this;
    }

    /**
     * Converts a relative position to an absolute index
     * @param {Array<Number>|Number} - An index or array starting at 1 as [x, y]
     * @param {Number} relativeIndex - The index relative to position
     * @returns {Number} The absolute index
     */
    relativePositionToIndex (position, relativePosition) {
        const index = this.positionToIndex(position);

        // prevent wrap-around on the sides
        if (index % this.width === 0 && relativePosition % 3 === 0) return null;
        if (index % this.width === this.width - 1 && relativePosition % 3 === 2) return null;

        //               base      vertical offset                                         horizontal offset
        const absIndex = (index) + ((Math.floor(relativePosition / 3) - 1) * this.width) + (relativePosition % 3 - 1);

        // check absIndex is within the board
        if (absIndex < 0 || absIndex > this.width * this.height - 1) return null;

        return absIndex;
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} relativePosition - The index relative to position
     * @returns {Ship}
     */
    getRelativeShip (position, relativePosition) {
        const index = this.relativePositionToIndex(position, relativePosition);
        return (index !== null) ? this.boardState[index] : null;
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} relativePosition - The index relative to position
     * @param {Ship|Number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only if value is a ship type)
     * @returns {BoardBuilder} this
     */
    setRelativeShip (position, relativePosition, value, pinned) {
        const index = this.relativePositionToIndex(position, relativePosition);

        if (index === null) return;

        return this.setShip(index, value, pinned);
    }

    // make this automatically infer the relative position from a ship type
    /**
     * Sets all surrounding squares to water
     * @param {Number|Number[]} position - An index or array starting at 1 as [x, y]
     * @param {Number} except - A relative position to set to a ship instead of water
     * @returns {BoardBuilder} this
     */
    setUnidirectionalWater (position, except) {
        for (const relativePosition in RELATIVE_POSITIONS) {
            const value = RELATIVE_POSITIONS[relativePosition];

            this.setRelativeShip(position, value, (except === value) ? PLAY_TYPES.SHIP : PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Sets ships on the sides of a bidirectional ship to water
     * @param {Number[]|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} orientation - GRAPHICAL.HORIZONTAL or .VERTICAL
     * @returns {BoardBuilder} this
     */
    setBidirectionalWater (position, orientation) {
        // could use some error handling to check if orientation is horizontal or vertical and not left or something

        const excludedDirections = (orientation === GRAPHICAL_TYPES.HORIZONTAL)
            ? [RELATIVE_POSITIONS.LEFT, RELATIVE_POSITIONS.RIGHT]
            : [RELATIVE_POSITIONS.UP, RELATIVE_POSITIONS.DOWN];

        for (const key in RELATIVE_POSITIONS) {
            const relativePosition = RELATIVE_POSITIONS[key];

            if (!excludedDirections.includes(relativePosition)) this.setRelativeShip(position, relativePosition, PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Flood the column with the given type or water
     * @param {Number} column The target column's index
     * @param {Number} [type] What to flood it with (defaults to water)
     * @returns {BoardBuilder} this
     */
    floodColumn (column, type) {
        for (let y = 0; y < this.height; y++) {
            const square = this.getShip([column + 1, y + 1]);
            if (square.playType === PLAY_TYPES.UKNOWN) this.setShip([column + 1, y + 1], type ?? PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Flood the row with the given type or water
     * @param {Number} row The target row's index
     * @param {Number} [type] What to flood it with (defaults to water)
     * @returns {BoardBuilder} this
     */
    floodRow (row, type) {
        for (let x = 0; x < this.width; x++) {
            const square = this.getShip([x + 1, row + 1]);
            if (square.playType === PLAY_TYPES.UKNOWN) this.setShip([x + 1, row + 1], type ?? PLAY_TYPES.WATER);
        }

        return this;
    }
}

export const RELATIVE_POSITIONS = {
    TOP_LEFT: 0,
    TOP: 1,
    TOP_RIGHT: 2,
    LEFT: 3,
    // CENTER: 4, (this)
    RIGHT: 5,
    BOTTOM_LEFT: 6,
    BOTTOM: 7,
    BOTTOM_RIGHT: 8
};

/**
 * Creates the boardState array
 * @param {BoardBuilder} [preset]
 * @returns {Ship[]}
 */
function createBoardState (width, height, preset) {
    if (preset) return preset.boardState;
    else {
        const out = [];

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                out.push(new Ship(PLAY_TYPES.UKNOWN));
            }
        }

        return out;
    }
}
