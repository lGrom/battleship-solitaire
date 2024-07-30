/* eslint-disable no-undef */
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship.js';

export default class BoardBuilder {
    /**
     * The underlying Board class. For use as a preset, supply width and height. For use as a puzzle, supply preset and either solution or verticalCount, horizontalCount, and runs.
     * @param {Number} width Width in squares
     * @param {Number} height Height in squares
     * @param {BoardBuilder} [preset] Pre-existing ships
     * @param {BoardBuilder} [solution] Ending board (leave undefined if using vert/hoz count and runs)
     * @param {Number[]} [columnCounts] Number of ships in each column (left to right)
     * @param {Number[]} [rowCounts] Number of ships in each row (top to bottom)
     * @param {Number[]} [runs] Number of each type of run (eg. 3 solos and 1 double = [3, 1])
     */
    constructor (width, height, preset, solution, columnCounts, rowCounts, runs) {
        // if (preset) {
        //     if (solution) {
        //         // interpret everything else
        //     } else if (runs && columnCounts && rowCounts) {
        //         // interpret solution
        //         // note: this solution should not be used for checking if the puzzle is solved, as it may not be the only one
        //         // instead, create an isSolved() function to check if the board's state meets all criteria
        //     }

        //     // check viability
        // } -TODO

        this.width = width || preset?.width || 4;
        this.height = height || preset?.height || 4;

        this.columnCounts = columnCounts;
        this.rowCounts = rowCounts;
        this.boardState = createBoardState(this.width, this.height, preset);

        this.runs = runs;
    }

    /**
     * Copies the board without pointing to the origial
     * @returns {BoardBuilder} A copy of the board
     */
    copy () {
        return new BoardBuilder(this.width, this.height, this, this.solution, this.columnCounts, this.rowCounts, this.runs);
    }

    /**
     * Compares the board states of two boards
     * @param {BoardBuilder} comparate The board to compare with
     * @returns {Boolean} true if equal, false if not
     */
    sameBoardState (comparate) {
        if (!(comparate instanceof BoardBuilder) || this.height !== comparate.height || this.width !== comparate.width) return false;

        for (let i = 0; i < this.width * this.height - 1; i++) {
            const ship = this.getShip(i);
            const comparateShip = comparate.getShip(i);

            if (!ship.equals(comparateShip)) return false;
        }

        return true;
    }

    // could be memoized, but it's unlikely to solve the same board multiple times (for now) -TODO
    /**
     * Solves the board
     * @param {BoardBuilder} ogBoard The original board to solve
     * @param {BoardBuilder} [cache] The answer in progress
     * @param {Number} [iteration]
     * @returns {BoardBuilder} The solved board
     */
    static solve (ogBoard, cache, iteration) {
        // should be replaced in the future for an adjustable setting
        const ITERATION_LIMIT = 15;

        const board = ((cache) ? cache.copy() : ogBoard.copy()).computeGraphicalTypes();
        iteration ||= 1;

        // REPLACE THESE WITH GETCOLUMN/ROWRUNS -TODO -URGENT
        /**
         * Count unkown and ship squares in a row
         * @param {number} y The row index (starts at 0)
         * @returns {number[]} [#ships, #unkown]
         */
        function countRow (y) {
            const counts = [0, 0];

            for (let x = 0; x < board.width; x++) {
                const ship = board.getShip([x, y]);

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

            for (let y = 0; y < board.height; y++) {
                const ship = board.getShip([x, y]);

                if (ship.playType === PLAY_TYPES.SHIP) counts[0]++;
                if (ship.playType === PLAY_TYPES.UKNOWN) counts[1]++;
            }

            return counts;
        }

        // check for full or would-be-full rows/columns

        for (let y = 0; y < board.height; y++) {
            const counts = countRow(y);
            const expected = board.rowCounts[y];

            if (counts[0] === expected) board.floodRow(y);
            if (counts[0] + counts[1] === expected) board.floodRow(y, PLAY_TYPES.SHIP);
        }

        for (let x = 0; x < board.width; x++) {
            const counts = countCol(x);
            const expected = board.columnCounts[x];

            if (counts[0] === expected) board.floodColumn(x);
            if (counts[0] + counts[1] === expected) board.floodColumn(x, PLAY_TYPES.SHIP);
        }

        // place water/ships around ships

        for (let i = 0; i < board.boardState.length; i++) {
            const square = board.getShip(i);

            if (square.playType !== PLAY_TYPES.SHIP) continue;

            if (square.isCardinal()) board.setCardinalShips(i, Ship.graphicalTypeToRelativePosition(square.graphicalType));
            else if (square.graphicalType === GRAPHICAL_TYPES.SINGLE) board.setCardinalShips(i); // makes every surrounding square water
            else if (square.isOrthogonal()) board.setOrthogonalShips(i, square.graphicalType);
            else board.floodCorners(i);
        }

        // "there's only one place it could go/places it could go overlap"\
        // -TODO -URGENT
        // make this only place one ship, rerun the whole thing, then do another ship, etc.
        // when you do that, set the for loop condition back to i > 1
        if (cache?.sameBoardState(board)) {
            const shipsLeft = board.countRunsLeft(true);
            const horizontalRuns = board.getHorizontalRuns();
            const verticalRuns = board.getVerticalRuns();

            // loop through each length of ship
            for (let i = shipsLeft.length; i > 2; i--) {
                const shipCount = shipsLeft[i];

                if (shipCount <= 0) continue;

                const filteredHRuns = horizontalRuns.filter(run => run.length >= i);
                const filteredVRuns = verticalRuns.filter(run => run.length >= i);

                if (filteredHRuns.length === 0 && filteredVRuns.length === 0) continue;

                const possiblities = {};
                let totalPossibilities = 0;

                function countPossibilities (run, horizontal) {
                    for (let j = 0; j + i <= run.length; j++) {
                        const tmpBoard = board.copy();
                        let changed = false;

                        for (let k = 0; k < i; k++) {
                            if (tmpBoard.softSetShip(run[k + j], PLAY_TYPES.SHIP)) changed = true;
                        }

                        if (!changed) continue;

                        // check if row ships > it's supposed to be
                        if (horizontal) {
                            const y = tmpBoard.indexToCoordinates(run[0])[1];
                            const numShips = tmpBoard.getRowRuns(y, false, true).flat().length;
                            if (numShips > tmpBoard.rowCounts[y]) continue;
                        } else {
                            const x = tmpBoard.indexToCoordinates(run[0])[0];
                            const numShips = tmpBoard.getColumnRuns(x, false, true).flat().length;

                            if (numShips > tmpBoard.columnCounts[x]) continue;
                        }

                        // check the ends of the run to see if it's really i long
                        if (tmpBoard.getRelativeShip(run[0], horizontal ? RELATIVE_POSITIONS.LEFT : RELATIVE_POSITIONS.TOP)?.playType === PLAY_TYPES.SHIP) continue;
                        if (tmpBoard.getRelativeShip(run[run.length - 1], horizontal ? RELATIVE_POSITIONS.RIGHT : RELATIVE_POSITIONS.BOTTOM)?.playType === PLAY_TYPES.SHIP) continue;

                        for (let k = 0; k < run.length; k++) {
                            if (possiblities[run[k + j]]) {
                                possiblities[run[k + j]]++;
                            } else {
                                possiblities[run[k + j]] = 1;
                            }
                        }

                        totalPossibilities++;
                    }
                }

                filteredHRuns.forEach((run) => { countPossibilities(run, true); });
                filteredVRuns.forEach((run) => { countPossibilities(run, false); });

                for (const pos in possiblities) {
                    if (possiblities[pos] === totalPossibilities) {
                        board.setShip(Number(pos), GRAPHICAL_TYPES.SHIP);
                    }
                }
            }
        }

        if (cache?.sameBoardState(board) || iteration >= ITERATION_LIMIT) return board.computeGraphicalTypes();
        else return BoardBuilder.solve(ogBoard, board, ++iteration);
    }

    /**
     * Counts which runs are left
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @returns {number[]|undefined} Number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
     */
    countRunsLeft (onlyCountComplete) {
        if (!this.runs) return;

        const lengths = this.getRuns(onlyCountComplete).map(run => run.length);
        const currentRuns = [];

        lengths.forEach(length => {
            const i = length - 1;
            currentRuns[i] = (currentRuns[i] || 0) + 1;
        });

        // a .map function doesnt work here since there're holes
        const runsLeft = [];
        for (let i = 0; i < Math.max(currentRuns.length, this.runs.length); i++) {
            runsLeft[i] = (this.runs[i] || 0) - (currentRuns[i] || 0);
        }

        return runsLeft;
    }

    /**
     * Gets the number, length, and position of all remaining runs
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @returns {number[]} The number, length, and position of all runs left
     */
    getRuns (onlyCountComplete) {
        let horizontalRuns = this.getHorizontalRuns(onlyCountComplete, true, true);
        let verticalRuns = this.getVerticalRuns(onlyCountComplete, true, true);

        const singleRuns = [];

        // consider doing this by checking for duplicates across the entire thing -TODO
        // distinguish snippets of vertical runs from solo ships
        horizontalRuns = horizontalRuns.filter((run) => {
            if (run.length === 1 && this.getRelativeShip(run[0], RELATIVE_POSITIONS.TOP)?.playType !== PLAY_TYPES.SHIP && this.getRelativeShip(run[0], RELATIVE_POSITIONS.BOTTOM)?.playType !== PLAY_TYPES.SHIP) singleRuns.push(run);
            return run.length !== 1;
        });

        // distinguish snippets of horizontal runs from solo ships
        verticalRuns = verticalRuns.filter((run) => {
            if (run.length === 1 && this.getRelativeShip(run[0], RELATIVE_POSITIONS.LEFT)?.playType !== PLAY_TYPES.SHIP && this.getRelativeShip(run[0], RELATIVE_POSITIONS.RIGHT)?.playType !== PLAY_TYPES.SHIP) singleRuns.push(run);
            return run.length > 1;
        });

        const filteredSingleRuns = [];

        // check if this could be replaced with a .map function -TODO
        // filter singleRuns for duplicates
        singleRuns.forEach((run) => {
            let duplicate = false;

            for (let i = 0; i < filteredSingleRuns.length && !duplicate; i++) {
                const compRun = filteredSingleRuns[i];
                if (
                    run.length === compRun.length &&
                    run[0] === compRun[0] &&
                    run[1] === compRun[1]
                ) duplicate = true;
            }

            if (!duplicate) filteredSingleRuns.push(run);
        });

        return filteredSingleRuns.concat(horizontalRuns, verticalRuns);
    }

    /**
     * Counts runs horizontally. Filters one ship runs unless unfiltered is true
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @param {boolean} [onlyCountShips] don't include unknown squares in the count. Defaults to false
     * @param {boolean} [unfiltered] don't filter the results for one ship runs. Defaults to false
     * @returns {Number[][]}
     */
    getHorizontalRuns (onlyCountComplete, onlyCountShips, unfiltered) {
        const runs = [];

        // put this in a seperate function -TODO
        for (let y = 0; y < this.height; y++) {
            for (const run of this.getRowRuns(y, onlyCountComplete, onlyCountShips)) {
                runs.push(run);
            }
        }

        if (unfiltered) return runs;
        return runs.filter(run => run.length > 1);
    }

    /**
     * Counts runs in the given row
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @param {boolean} [onlyCountShips] don't include unknown squares in the count. Defaults to false
     * @returns {Number[][]}
     */
    getRowRuns (y, onlyCountComplete, onlyCountShips) {
        const runs = [];
        let run = [];

        for (let x = 0; x < this.width; x++) {
            if (onlyCountShips ? this.getShip([x, y]).playType === PLAY_TYPES.SHIP : this.getShip([x, y]).playType !== PLAY_TYPES.WATER) {
                run.push(this.positionToIndex([x, y]));
            } else if (run[0] && (onlyCountComplete ? (this.getShip(run[0]).isEnd() && this.getShip([x - 1, y]).isEnd()) : true)) {
                // run ended, record it
                runs.push(run);
                run = [];
            }
        }

        if (run[0] && (onlyCountComplete ? (this.getShip(run[0]).isEnd() && this.getShip([this.width - 1, y]).isEnd()) : true)) {
            // end of the board. record any ongoing runs.
            runs.push(run);
        }

        return runs;
    }

    /**
     * Counts runs vertically. Filters one ship runs unless unfiltered == true
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right)
     * @param {boolean} [onlyCountShips] -- don't include unknown squares in the count
     * @param {boolean} [unfiltered] -- don't filter the results for one ship runs
     * @returns {Number[][]}
     */
    getVerticalRuns (onlyCountComplete, onlyCountShips, unfiltered) {
        const runs = [];

        for (let x = 0; x < this.width; x++) {
            for (const run of this.getColumnRuns(x, onlyCountComplete, onlyCountShips)) {
                runs.push(run);
            }
        }

        if (unfiltered) return runs;
        return runs.filter(run => run.length > 1);
    }

    /**
     * Counts runs in the given column
     * @param {boolean} [onlyCountComplete] Only count runs that start and end with an end ship (eg. up, down, left, right)
     * @param {boolean} [onlyCountShips] -- don't include unknown squares in the count
     * @returns {Number[][]}
     */
    getColumnRuns (x, onlyCountComplete, onlyCountShips) {
        const runs = [];
        let run = [];

        for (let y = 0; y < this.height; y++) {
            if (onlyCountShips ? this.getShip([x, y]).playType === PLAY_TYPES.SHIP : this.getShip([x, y]).playType !== PLAY_TYPES.WATER) {
                run.push(this.positionToIndex([x, y]));
            } else if (run[0] && (onlyCountComplete ? this.getShip(run[0]).isEnd() && this.getShip([x, y - 1]).isEnd() : true)) {
                // run ended, record it
                runs.push(run);
                run = [];
            }
        }

        if (run[0] && (onlyCountComplete ? (this.getShip(run[0]).isEnd() && this.getShip([x, this.height - 1]).isEnd()) : true)) {
            // end of the column. record any ongoing runs.
            runs.push(run);
        }

        return runs;
    }

    // consistency in syntax and whatnot could use some work here
    computeGraphicalTypes () {
        for (let i = 0; i < this.width * this.height; i++) {
            const ship = this.getShip(i);
            if (ship.pinned) continue;

            // for legiability
            const [isShip, isWater] = [Ship.isShip, Ship.isWater];

            if (!isShip(ship)) continue;

            function setType (type) {
                ship.setGraphicalType(type);
            }

            // makes the edges act as water
            const left = this.getRelativeShip(i, RELATIVE_POSITIONS.LEFT) || new Ship(PLAY_TYPES.WATER);
            const top = this.getRelativeShip(i, RELATIVE_POSITIONS.TOP) || new Ship(PLAY_TYPES.WATER);
            const right = this.getRelativeShip(i, RELATIVE_POSITIONS.RIGHT) || new Ship(PLAY_TYPES.WATER);
            const bottom = this.getRelativeShip(i, RELATIVE_POSITIONS.BOTTOM) || new Ship(PLAY_TYPES.WATER);

            // now just do all the logic from here and have a grand ol' time
            if (isWater([left, top, right, bottom])) setType(GRAPHICAL_TYPES.SINGLE);
            else if (isShip([left, right])) setType(GRAPHICAL_TYPES.HORIZONTAL);
            else if (isShip([top, bottom])) setType(GRAPHICAL_TYPES.VERTICAL);

            // else if (isShip(left) && )
            else if (isShip(left) && isWater(right)) setType(GRAPHICAL_TYPES.LEFT);
            else if (isShip(top) && isWater(bottom)) setType(GRAPHICAL_TYPES.UP);
            else if (isShip(right) && isWater(left)) setType(GRAPHICAL_TYPES.RIGHT);
            else if (isShip(bottom) && isWater(top)) setType(GRAPHICAL_TYPES.DOWN);

            // if surrounded by nothing, set unknown ship
            else setType(PLAY_TYPES.SHIP);
        }

        return this;
    }

    /**
     * @param {Number[]} coordinates - An array starting at 0 as [x, y]
     * @returns {Number}
     */
    coordinatesToIndex (coordinates) {
        const [x, y] = coordinates;

        if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
            throw new Error('Invalid input: coordinates must not exceed board dimensions');
        }

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Invalid input: coordinates must be integers');
        }

        // paranthesis for legability
        return y * this.width + x;
    }

    /**
     * @param {Number} index
     * @returns {Number[]} An array starting at 0 as [x, y]
     */
    indexToCoordinates (index) {
        if (!Number.isInteger(index)) {
            throw new Error('Invalid input: coordinates must be integers');
        }

        return [index % this.width, Math.floor(index / this.width)];
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @returns {Number}
     */
    positionToIndex (position) {
        if (typeof position === 'number' && position >= 0) return position;
        if (Array.isArray(position)) return this.coordinatesToIndex(position);
        throw new Error(`Invalid input: position must be an index or array of coordinates. Received: (${typeof position}) ${position}`);
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @returns {Ship}
     */
    getShip (position) {
        const index = this.positionToIndex(position);
        return this.boardState[index];
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only works if value is a ship type)
     * @returns {BoardBuild} this
     */
    setShip (position, value, pinned) {
        const index = this.positionToIndex(position);

        let ship = value;

        if (value instanceof Ship);
        else if (typeof value === 'number') ship = new Ship(value, pinned);
        else throw new Error('value should be an instance of Ship or a ship type');

        if (pinned && typeof pinned !== 'boolean') throw new Error('expected pinned to be boolean, received: ' + pinned);

        const tmpBoard = this.copy();
        tmpBoard.boardState[index] = ship;
        this.boardState = tmpBoard.boardState;

        return this;
    }

    /**
     * Sets the ship only if the square is unkown
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only works if value is a ship type)
     * @returns {boolean} True if the ship was set, false if not
     */
    softSetShip (position, value, pinned) {
        if (this.getShip(position).playType !== PLAY_TYPES.UKNOWN) return false;

        this.setShip(position, value, pinned);
        return true;
    }

    /**
     * Converts a relative position to an absolute index
     * @param {Number[]|Number} - An index or array starting at 0 as [x, y]
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
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @param {Number} relativePosition - The index relative to position
     * @returns {Ship}
     */
    getRelativeShip (position, relativePosition) {
        const index = this.relativePositionToIndex(position, relativePosition);
        return (index !== null) ? this.boardState[index] : null;
    }

    /**
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
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

    // make this automatically infer the relative position from a ship type -TODO
    /**
     * Sets all surrounding squares to water
     * @param {Number|Number[]} position - An index or array starting at 0 as [x, y]
     * @param {Number} [except] - A relative position to set to a ship instead of water
     * @returns {BoardBuilder} this
     */
    setCardinalShips (position, except) {
        for (const relativePosition in RELATIVE_POSITIONS) {
            const value = RELATIVE_POSITIONS[relativePosition];

            this.setRelativeShip(position, value, (except === value) ? PLAY_TYPES.SHIP : PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Sets ships on the sides of a ship to water
     * @param {Number[]|Number} position - An index or array starting at 0 as [x, y]
     * @param {Number} orientation - GRAPHICAL.HORIZONTAL or .VERTICAL
     * @returns {BoardBuilder} this
     */
    setOrthogonalShips (position, orientation) {
        // could use some error handling to check if orientation is horizontal or vertical and not left or something -TODO

        const shipDirections = (orientation === GRAPHICAL_TYPES.HORIZONTAL)
            ? [RELATIVE_POSITIONS.LEFT, RELATIVE_POSITIONS.RIGHT]
            : [RELATIVE_POSITIONS.TOP, RELATIVE_POSITIONS.BOTTOM];

        for (const key in RELATIVE_POSITIONS) {
            const relativePosition = RELATIVE_POSITIONS[key];

            if (!shipDirections.includes(relativePosition)) this.setRelativeShip(position, relativePosition, PLAY_TYPES.WATER);
            else if (this.getRelativeShip(relativePosition)?.playType !== PLAY_TYPES.SHIP) this.setRelativeShip(position, relativePosition, PLAY_TYPES.SHIP);
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
            const square = this.getShip([column, y]);
            if (square.playType === PLAY_TYPES.UKNOWN) this.setShip([column, y], type ?? PLAY_TYPES.WATER);
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
            const square = this.getShip([x, row]);
            if (square.playType === PLAY_TYPES.UKNOWN) this.setShip([x, row], type ?? PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Places water in all corners around a square
     * @param {Number|Number[]} position - An index or array starting at 0 as [x, y]
     * @returns {BoardBuilder} this
     */
    floodCorners (position) {
        this.setRelativeShip(position, RELATIVE_POSITIONS.TOP_LEFT, PLAY_TYPES.WATER);
        this.setRelativeShip(position, RELATIVE_POSITIONS.TOP_RIGHT, PLAY_TYPES.WATER);
        this.setRelativeShip(position, RELATIVE_POSITIONS.BOTTOM_LEFT, PLAY_TYPES.WATER);
        this.setRelativeShip(position, RELATIVE_POSITIONS.BOTTOM_RIGHT, PLAY_TYPES.WATER);
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
    const out = [];

    for (let i = 0; i < width * height; i++) {
        if (preset) {
            const ship = preset.getShip(i);
            out.push(new Ship(ship.graphicalType, ship.pinned));
        } else {
            out.push(new Ship(PLAY_TYPES.UKNOWN));
        }
    }

    return out;
}
