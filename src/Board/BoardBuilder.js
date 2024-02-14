import Ship, { GRAPHICAL_TYPES, INTERNAL_TYPES, PLAY_TYPES } from './Ship';

/**
 * The underlying Board class. For use as a preset, supply width and height. For use as a puzzle, supply preset and either solution or verticalCount, horizontalCount, and shipsLeft.
 * @param {Number} width Width in squares
 * @param {Number} height Height in squares
 * @param {BoardBuilder} [preset] Pre-existing ships
 * @param {BoardBuilder} [solution] Ending board (leave undefined if using vert/hoz count and shipsLeft)
 * @param {Number[]} [verticalCount] Number of ships in each column (left to right)
 * @param {Number[]} [horizontalCount] Number of ships in each row (top to bottom)
 * @param {Number[]} [shipsLeft] Number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
 */
export default class BoardBuilder {
    constructor (width, height, preset, solution, verticalCount, horizontalCount, shipsLeft) {
        // if !width and preset exists, set width to preset width
        this.width = width || !!preset ? preset.width : 4;
        this.height = height || !!preset ? preset.height : 4;

        if (preset) {
            if (solution) {
                // interpret everything else
            } else if (shipsLeft && verticalCount && horizontalCount) {
                // interpret solution
                // note: this solution should not be used for checking if the puzzle is solved, as it may not be the only one
                // instead, create an isSolved() function to check if the board's state meets all criteria
            }

            // check viability
        }

        this.boardState = createBoardState(this.width, this.height, this.preset);
    }

    // could be memoized, but it's unlikely to solve the same board multiple times (for now)
    /**
     * Solves the board
     * @param {BoardBuilder} ogBoard The original board to solve
     * @param {BoardBuilder} [cache] The answer in progress
     * @param {Number} [iteration]
     */
    solve (ogBoard, cache, iteration) {
        const tmp = cache || new BoardBuilder(ogBoard.width, ogBoard.height, ogBoard.preset, undefined, ogBoard.verticalCount, ogBoard.horizontalCount, ogBoard.shipsLeft);
        tmp.boardState = structuredClone(ogBoard.boardState);
        tmp.computeGraphicalTypes();

        // ALL THE LOGIC

        for (let i = 0; i < tmp.boardState.length; i++) {
            const square = tmp.boardState[i];
            if (square.isUnidirectional()) tmp.setRelativeWater(i, Ship.graphicalTypeToRelativePosition(square.graphicalType));

            // full rows/columns
            // rows/columns that would be full if all unkown squares were ships
            // see where remaining ships could fit. if one can only fit in one place, put it there and remove it from all other possibilities
        }

        // END OF ALL THE LOGIC

        if (tmp !== cache) {
            this.solve(ogBoard, tmp, iteration++ || 1);
        }
    }

    // consistency in syntax and whatnot could use some work here
    computeGraphicalTypes () {
        const board = this.boardState;

        // uses setInternalType because that also runs setGraphicalType
        for (let i = 0; i < board.length; i++) {
            if (board[i].pinned) return;

            // for legiability
            const [isShip, isUnkown, isWater] = [Ship.isShips, Ship.isUnkown, Ship.isWater];
            if (!isShip(board[i])) continue;

            function setType (type) {
                board[i].setInternalType(type);
            }

            // makes the edges act as water
            const left = this.getRelativeShip(i, RELATIVE_POSITIONS.LEFT) || new Ship(PLAY_TYPES.WATER);
            const top = this.getRelativeShip(i, RELATIVE_POSITIONS.TOP) || new Ship(PLAY_TYPES.WATER);
            const right = this.getRelativeShip(i, RELATIVE_POSITIONS.RIGHT) || new Ship(PLAY_TYPES.WATER);
            const bottom = this.getRelativeShip(i, RELATIVE_POSITIONS.BOTTOM) || new Ship(PLAY_TYPES.WATER);

            // now just do all the logic from here and have a grand old time
            if (isWater([left, top, right, bottom])) setType(GRAPHICAL_TYPES.SINGLE);
            else if (
                isShip([left, right]) ||
                (isShip(left) && isUnkown(right)) ||
                (isShip(right && isUnkown(left)))) setType(INTERNAL_TYPES.HORIZONTAL);
            else if (
                isShip([top, bottom]) ||
                (isShip(top) && isUnkown(bottom)) ||
                (isShip(bottom) && isUnkown(top))) setType(INTERNAL_TYPES.VERTICAL);

            // now for the billion ship ship water cases
            // else if (isShip(left) && )
            else if (isShip(left) && isWater(right)) setType(GRAPHICAL_TYPES.LEFT);
            else if (isShip(top) && isWater(bottom)) setType(GRAPHICAL_TYPES.UP);
            else if (isShip(right) && isWater(left)) setType(GRAPHICAL_TYPES.RIGHT);
            else if (isShip(bottom) && isWater(top)) setType(GRAPHICAL_TYPES.DOWN);
        }
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

        if (value instanceof Ship) ship = value;
        else if (typeof value === 'number') ship = new Ship(value, pinned);
        else throw new Error('value should be an instance of Ship or a ship type');

        const tmpBoard = this.boardState;
        tmpBoard[index] = ship;
        this.boardState = tmpBoard;

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

        if (index === null) throw new Error('Index is not within board dimensions');

        return this.setShip(index, value, pinned);
    }

    /**
     * Sets all surrounding squares to water
     * @param {Number[]|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} except - A relative position to set to a ship instead of water
     * @returns {BoardBuilder} this
     */
    setRelativeWater (position, except) {
        for (const relativePosition in RELATIVE_POSITIONS) {
            const value = RELATIVE_POSITIONS[relativePosition];

            this.setRelativeShip(position, value, (except === value) ? PLAY_TYPES.SHIP : PLAY_TYPES.WATER);
        }
    }

    // move to the react component eventually
    displayBoard () {
        return this.boardState.map((ship, index) => {
            return <div
                className="Square nohighlight"
                key={index}
                onMouseUp={(event) => this.handleClick(event, index)}
                onContextMenu={(e) => e.preventDefault()}
            >
                {ship.toString()}
            </div>;
        });
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
