/**
 * @typedef {number[]} Run
 * An array of indicies representing sqaures in a run
 */

import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Ship.js';

/**
 * The underlying Board class. For use as a preset, supply width and height. For use as a puzzle, also supply preset, counts, and runs.
 * @param {number|BoardBuilder|string} [widthOrPreset] - Width in squares (default 4) or the preset
 * @param {number|number[]} [heightOrColumnCounts] - Height in squares (default 4) or column counts
 * @param {BoardBuilder|string|number[]} [presetOrRowCounts] - Pre-existing ships or row counts
 * @param {number[]} [columnCountsOrRunCounts] - Number of ships in each column (left to right) or runs
 * @param {number[]} [rowCounts] - Number of ships in each row (top to bottom)
 * @param {number[]} [runs] - Number of each type of run (eg. 3 solos and 1 double = [3, 1])
 */
export default class BoardBuilder {
    constructor (widthOrPreset, heightOrColumnCounts, presetOrRowCounts, columnCountsOrRunCounts, rowCounts, runs) {
        if (widthOrPreset instanceof BoardBuilder) {
            const preset = widthOrPreset;

            this.width = widthOrPreset.width;
            this.height = widthOrPreset.height;
            this.preset = preset;
            this.columnCounts = heightOrColumnCounts;
            this.rowCounts = presetOrRowCounts;
            this.runs = columnCountsOrRunCounts;
            this.boardState = createBoardState(this.width, this.height, preset);
        } else if (typeof widthOrPreset === 'string') {
            const board = BoardBuilder.b64ToBoard(widthOrPreset);

            this.width = board.width;
            this.height = board.height;
            this.preset = board.preset;
            this.columnCounts = board.columnCounts;
            this.rowCounts = board.rowCounts;
            this.runs = board.runs;
            this.boardState = board.boardState;
        } else {
            const width = widthOrPreset;
            if (presetOrRowCounts && (presetOrRowCounts.width !== width || presetOrRowCounts.height !== heightOrColumnCounts)) throw new Error(`Preset should be the same size as the new board. Expected (${width}, ${heightOrColumnCounts}), received (${presetOrRowCounts.width}, ${presetOrRowCounts.height})`);

            this.width = width || this.preset?.width || 4;
            this.height = heightOrColumnCounts || this.preset?.height || 4;

            this.preset = presetOrRowCounts;
            this.columnCounts = columnCountsOrRunCounts;
            this.rowCounts = rowCounts;
            this.boardState = createBoardState(this.width, this.height, this.preset);

            this.runs = runs;
        }
    }

    /**
     * Converts the board to its base64 representation
     * If the board has no counts or runs, they will be exported as 0
     * @returns {string} The base64 version of the board
     */
    export () {
        let out = '';

        out += (this.width - 1).toString(2).padStart(8, '0');
        out += (this.height - 1).toString(2).padStart(8, '0');

        const colCounts = this.columnCounts ? this.columnCounts : Array(this.width).fill(0);
        for (let i = 0; i < this.width; i++ ) {
            out += colCounts[i].toString(2).padStart(Math.ceil(Math.log2(this.width)) + 1, '0');
        }

        const rowCounts = this.rowCounts ? this.rowCounts : Array(this.height).fill(0);
        for (let i = 0; i < this.height; i++ ) {
            out += rowCounts[i].toString(2).padStart(Math.ceil(Math.log2(this.height)) + 1, '0');
        }

        let runsBytes = '';
        const runs = this.runs ? this.runs : [0];
        const runBuffer = Math.max(Math.ceil(Math.log2(this.width)), Math.ceil(Math.log2(this.height)) + 1);
        runs.forEach((count, size) => {
            runsBytes += size.toString(2).padStart(runBuffer, '0');
            runsBytes += count.toString(2).padStart(runBuffer, '0');
        });

        out += runs.length.toString(2).padStart(8, '0');
        out += runsBytes;

        let currentUnknowns = 0;
        let currentWaters = 0;

        const maxLength = Math.ceil(Math.log2(this.width * this.height + 1));
        function addMultipleShips () {
            if (currentUnknowns * 5 > 5 + maxLength) {
                out += '11111';
                out += (currentUnknowns - 1).toString(2).padStart(maxLength, '0');
            } else if (currentUnknowns > 0) {
                for (let j = 0; j < currentUnknowns; j++ ) {
                    out += '00000';
                }
            } else if (currentWaters * 5 > 5 + maxLength) {
                out += '11110';
                out += (currentWaters - 1).toString(2).padStart(maxLength, '0');
            } else {
                for (let j = 0; j < currentWaters; j++ ) {
                    out += '00001';
                }
            }
        }

        for (let i = 0; i < this.width * this.height; i++) {
            if (currentUnknowns !== 0 || currentWaters !== 0) {
                addMultipleShips();
                currentUnknowns = 0;
                currentWaters = 0;
            }

            if (this.boardState[i].graphicalType === GRAPHICAL_TYPES.UNKNOWN) {
                currentUnknowns++;
                continue;
            } else if (this.boardState[i].graphicalType === GRAPHICAL_TYPES.WATER) {
                currentWaters++;
                continue;
            }

            out += this.boardState[i].pinned ? '1' : '0';
            out += this.boardState[i].graphicalType.toString(2).padStart(4, '0');
        }

        addMultipleShips();

        const paddedString = out.length % 8 === 0 ? out : out + '0'.repeat(8 - (out.length % 8));

        const byteArray = [];
        for (let i = 0; i < out.length; i += 8) {
            byteArray.push(parseInt(paddedString.slice(i, i + 8), 2));
        }

        // eslint-disable-next-line no-undef
        return btoa(String.fromCharCode(...byteArray));
    }

    /**
     * Converts a base64 board to its BoardBuilder object counterpart
     * @param {string} base64 - The base64 board to convert
     * @returns {BoardBuilder} The board as a BoardBuilder object
     */
    static b64ToBoard (base64) {
        // eslint-disable-next-line no-undef
        const string = atob(base64);

        let binaryString = '';
        for (let i = 0; i < string.length; i++) {
            binaryString += string.charCodeAt(i).toString(2).padStart(8, '0');
        }

        function trim (length) {
            binaryString = binaryString.slice(length);
        }

        const width = parseInt(binaryString.slice(0, 8), 2) + 1;
        const height = parseInt(binaryString.slice(8, 16), 2) + 1;

        trim(16);

        const colCounts = [];
        for (let i = 0; i < width; i++) {
            colCounts.push(parseInt(binaryString.slice(0, Math.ceil(Math.log2(width)) + 1), 2));
            trim(Math.ceil(Math.log2(width)) + 1);
        }

        const rowCounts = [];
        for (let i = 0; i < height; i++) {
            rowCounts.push(parseInt(binaryString.slice(0, Math.ceil(Math.log2(height)) + 1), 2));
            trim(Math.ceil(Math.log2(height)) + 1);
        }

        const runBits = Math.max(Math.ceil(Math.log2(width)), Math.ceil(Math.log2(height)) + 1);
        const runEntries = parseInt(binaryString.slice(0, 8), 2);
        trim(8);

        const runs = [];
        for (let i = 0; i < runEntries; i++) {
            const size = parseInt(binaryString.slice(0, runBits), 2);
            trim(runBits);
            const count = parseInt(binaryString.slice(0, runBits), 2);
            trim(runBits);

            runs[size] = count;
        }

        const state = [];
        let i = 0;
        while (i < width * height && binaryString.length >= 5) {
            const bits = binaryString.slice(0, 5);
            const pinned = binaryString.slice(0, 1) === '1';
            const type = parseInt(binaryString.slice(1, 5), 2);
            trim(5);

            const maxLength = Math.ceil(Math.log2(width * height + 1));

            if (bits === '11111' || bits === '11110') {
                const repeats = parseInt(binaryString.slice(0, maxLength), 2) + 1;
                trim(maxLength);


                for (let j = 0; j < repeats; j++ ) {
                    state.push(new Ship(bits === '11111' ? GRAPHICAL_TYPES.UNKNOWN : GRAPHICAL_TYPES.WATER));
                    i++;
                }
            } else {
                state.push(new Ship(type, pinned));
            }
        }

        const board = new BoardBuilder(width, height, undefined, colCounts, rowCounts, runs);
        board.boardState = state;

        return board;
    }

    /**
     * Resets the board
     * @returns {BoardBuilder} this
     */
    reset () {
        this.boardState = createBoardState(this.width, this.height, this.preset);
        return this;
    }

    /**
     * Copies the board without pointing to the origial
     * @returns {BoardBuilder} A copy of the board
     */
    copy () {
        return new BoardBuilder(this.width, this.height, this, this.columnCounts, this.rowCounts, this.runs);
    }

    /**
     * Compares the board states of two boards
     * @param {BoardBuilder} comparate - The board to compare with
     * @returns {boolean} true if equal, false if not
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
     * @param {BoardBuilder} ogBoard - The original board to solve
     * @param {BoardBuilder} [cache] - The answer in progress
     * @param {number} [iteration] - How many times the function has been run
     * @returns {BoardBuilder} The solved board
     */
    static solve (ogBoard, cache, iteration) {
        // should be replaced in the future for an adjustable setting
        const ITERATION_LIMIT = 15;

        const board = ((cache) ? cache.copy() : ogBoard.copy()).computeGraphicalTypes();
        iteration ||= 1;

        // check for full or would-be-full rows/columns

        for (let y = 0; y < board.height; y++) {
            const counts = board.countRow(y);
            const expected = board.rowCounts[y];

            if (counts[0] === expected) board.softFloodRow(y);
            if (counts[0] + counts[1] === expected) board.softFloodRow(y, PLAY_TYPES.SHIP);
        }

        for (let x = 0; x < board.width; x++) {
            const counts = board.countCol(x);
            const expected = board.columnCounts[x];

            if (counts[0] === expected) board.softFloodColumn(x);
            if (counts[0] + counts[1] === expected) board.softFloodColumn(x, PLAY_TYPES.SHIP);
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

                // define this outside of the for loop, that's gotta be crazy inefficient -TODO
                /**
                 * Counts possibilities and adds them to a list
                 * @param {Run} run - The run to count
                 * @param {boolean} horizontal - True if the run spans horizontally, false if not
                 */
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
                            const numShips = tmpBoard.countRow(y, tmpBoard)[0];
                            if (numShips > tmpBoard.rowCounts[y]) continue;
                        } else {
                            const x = tmpBoard.indexToCoordinates(run[0])[0];
                            const numShips = tmpBoard.countCol(x, tmpBoard)[0];

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
     * checks if the board is solved
     * @returns {boolean} if the board is solved
     */
    isSolved () {
        for (const square of this.boardState) {
            if (square.playType === PLAY_TYPES.UNKNOWN) return false;
        }

        for (let x = 0; x < this.width; x++) {
            const counts = this.countCol(x);
            if (counts[0] !== this.columnCounts[x]) return false;
        }

        for (let y = 0; y < this.height; y++) {
            const counts = this.countRow(y);
            if (counts[0] !== this.rowCounts[y]) return false;
        }

        const runsLeft = this.countRunsLeft(false);
        for (const count of runsLeft) {
            if (count !== 0) return false;
        }

        return true;
    }

    /**
     * Count unknown and ship squares in a column
     * @param {number} x - The x position of the column
     * @returns {number[]} [#ships, #unknown]
     * @throws {RangeError} If x is outside of the board. Should be between 0 and this.width - 1
     */
    countCol (x) {
        if (x > this.width - 1 || x < 0) throw new RangeError(`x (${x}) is outside of the board (min: 0, max: ${this.width - 1})`);

        const counts = [0, 0];

        for (let y = 0; y < this.height; y++) {
            const type = this.getShip([x, y]).playType;

            if (type === PLAY_TYPES.SHIP) counts[0]++;
            if (type === PLAY_TYPES.UNKNOWN) counts[1]++;
        }

        return counts;
    }

    /**
     * Count unknown and ship squares in a row
     * @param {number} y - The row index (starts at 0)
     * @returns {number[]} [#ships, #unknown]
     * @throws {RangeError} If y is outside of the board. Should be between 0 and this.height - 1
     */
    countRow (y) {
        if (y > this.height - 1 || y < 0) throw new RangeError(`y (${y}) is outside of the board (min: 0, max: ${this.height - 1})`);

        const counts = [0, 0];

        for (let x = 0; x < this.width; x++) {
            const type = this.getShip([x, y]).playType;

            if (type === PLAY_TYPES.SHIP) counts[0]++;
            if (type === PLAY_TYPES.UNKNOWN) counts[1]++;
        }

        return counts;
    }

    /**
     * Counts which runs are left
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @returns {number[]|undefined} The number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
     */
    countRunsLeft (onlyCountComplete) {
        if (!this.runs) return;

        const lengths = this.getRuns(onlyCountComplete).map(run => run.length);
        const currentRuns = [];

        lengths.forEach(length => {
            const i = length - 1;
            currentRuns[i] = (currentRuns[i] || 0) + 1;
        });

        // a .map function doesnt work here since there are holes
        const runsLeft = [];
        for (let i = 0; i < Math.max(currentRuns.length, this.runs.length); i++) {
            runsLeft[i] = (this.runs[i] || 0) - (currentRuns[i] || 0);
        }

        return runsLeft;
    }

    /**
     * Gets the number, length, and position of all remaining runs.
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
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
            if (onlyCountComplete && this.getShip(run[0]).graphicalType !== GRAPHICAL_TYPES.SINGLE) return;

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
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @param {boolean} [onlyCountShips=false] - don't include unknown squares in the count. Defaults to false
     * @param {boolean} [unfiltered=false] - don't filter the results for one ship runs. Defaults to false
     * @returns {Run[]} An array with the all horizontal runs within
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
     * @param {number} y - The index of the row
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right). Defaults to false
     * @param {boolean} [onlyCountShips=false] - don't include unknown squares in the count. Defaults to false
     * @returns {Run[]} An array with the all the row's runs within
     * @throws {RangeError} If y is outside of the board
     */
    getRowRuns (y, onlyCountComplete, onlyCountShips) {
        if (y > this.height - 1) throw new RangeError(`y (${y}) is outside of the board (min: 0, max: ${this.height - 1})`);

        const runs = [];
        let run = [];

        for (let x = 0; x < this.width; x++) {
            if (onlyCountShips ? this.getShip([x, y]).playType === PLAY_TYPES.SHIP : this.getShip([x, y]).playType !== PLAY_TYPES.WATER) {
                run.push(this.positionToIndex([x, y]));
            } else if (run[0] !== undefined && ((onlyCountComplete && onlyCountShips) ? (this.getShip(run[0]).isEnd() && this.getShip([x - 1, y]).isEnd()) : true)) {
                // run ended, record it
                runs.push(run);
                run = [];
            }
        }

        if (run[0] !== undefined && ((onlyCountComplete && onlyCountShips) ? (this.getShip(run[0]).isEnd() && this.getShip([this.width - 1, y]).isEnd()) : true)) {
            // end of the board. record any ongoing runs.
            runs.push(run);
        }

        return runs;
    }

    /**
     * Counts runs vertically. Filters one ship runs unless unfiltered == true
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right)
     * @param {boolean} [onlyCountShips=false] -- don't include unknown squares in the count
     * @param {boolean} [unfiltered] -- don't filter the results for one ship runs
     * @returns {Run[]} An array with the all the vertical within
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
     * @param {number} x - The index of the column
     * @param {boolean} [onlyCountComplete=false] - Only count runs that start and end with an end ship (eg. up, down, left, right)
     * @param {boolean} [onlyCountShips=false] -- don't include unknown squares in the count
     * @returns {Run[]}  An array with the all the column's runs within
     * @throws {RangeError} If x is outside of the board
     */
    getColumnRuns (x, onlyCountComplete, onlyCountShips) {
        if (x > this.width - 1) throw new RangeError(`x (${x}) must be within the board (min: 0, max: ${this.width - 1})`);

        const runs = [];
        let run = [];

        for (let y = 0; y < this.height; y++) {
            if (onlyCountShips ? this.getShip([x, y]).playType === PLAY_TYPES.SHIP : this.getShip([x, y]).playType !== PLAY_TYPES.WATER) {
                run.push(this.positionToIndex([x, y]));
            } else if (run[0] !== undefined && ((onlyCountComplete && onlyCountShips) ? this.getShip(run[0]).isEnd() && this.getShip([x, y - 1]).isEnd() : true)) {
                // run ended, record it
                runs.push(run);
                run = [];
            }
        }

        if (run[0] !==undefined && ((onlyCountComplete && onlyCountShips) ? (this.getShip(run[0]).isEnd() && this.getShip([x, this.height - 1]).isEnd()) : true)) {
            // end of the column. record any ongoing runs.
            runs.push(run);
        }

        return runs;
    }

    // consistency in syntax and whatnot could use some work here -TODO
    // add jsdoc here -TODO
    computeGraphicalTypes () {
        for (let i = 0; i < this.width * this.height; i++) {
            const ship = this.getShip(i);
            if (ship.pinned && ship.graphicalType > PLAY_TYPES.SHIP) continue;

            // for legibility
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
     * Converts a set of coordinates to an index
     * @param {number[]} coordinates - An array starting at 0 as [x, y]
     * @returns {number} The index
     * @throws {RangeError} If coordinates are not within the board
     * @throws {TypeError} If coordinates are not integers
     */
    coordinatesToIndex (coordinates) {
        const [x, y] = coordinates;

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new TypeError(`coordinates must be integers (are ${typeof x} and ${typeof y})`);
        }

        if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
            throw new RangeError(`coordinates (${x}, ${y}) must be within board`);
        }

        // paranthesis for legability
        return y * this.width + x;
    }

    /**
     * Converts an index to a set of coordinates
     * @param {number} index - The index
     * @returns {number[]} An array starting at 0 as [x, y]
     * @throws {RangeError} If coordinates are not within the board
     * @throws {TypeError} If coordinates are not integers
     */
    indexToCoordinates (index) {
        if (index < 0 || index > this.width * this.height - 1) throw new RangeError(`index (${index}) must be within the board (min: 0, max: ${this.width * this.height - 1})`);
        if (!Number.isInteger(index)) throw new TypeError(`index must be an integer (is ${typeof index})`);

        return [index % this.width, Math.floor(index / this.width)];
    }

    /**
     * Converts a position (coordinates or index) into an index
     * @param {number[] | number} position - An index or array starting at 0 as [x, y]
     * @returns {number} The index
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     */
    positionToIndex (position) {
        if (typeof position === 'number') {
            if (position < 0 || position > this.width * this.height - 1) throw new RangeError(`index (${position}) must be within the board (min: 0, max: ${this.width * this.height - 1})`);
            return position;
        } else if (Array.isArray(position) && position.length === 2) {
            if (position[0] < 0 || position[0] > this.width - 1 || position[1] < 0 || position[1] > this.height - 1) throw new RangeError(`coordinates (${position[0]}, ${position[1]}) must be within the board`);
            return this.coordinatesToIndex(position);
        }

        throw new TypeError(`position (${position}) must be an index or array of coordinates (is ${typeof position})`);
    }

    /**
     * Get the ship at a position
     * @param {number[] | number} position - An index or array starting at 0 as [x, y]
     * @returns {Ship} The ship
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     */
    getShip (position) {
        const index = this.positionToIndex(position);
        return this.boardState[index];
    }

    /**
     * Set the ship at a position
     * @param {number[] | number} position - An index or array starting at 0 as [x, y]
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only works if value is a ship type)
     * @returns {BoardBuilder} this
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     * @throws {TypeError} If value is not a ship nor a graphical or play type
     */
    setShip (position, value, pinned) {
        const index = this.positionToIndex(position);

        let ship = value;

        if (typeof value === 'number') ship = new Ship(value, pinned);
        else if (!(value instanceof Ship)) throw new TypeError('value should be an instance of Ship or a ship type');

        if (pinned && typeof pinned !== 'boolean') throw new TypeError('expected pinned to be boolean, received: ' + pinned);

        const tmpBoard = this.copy();
        tmpBoard.boardState[index] = ship;
        this.boardState = tmpBoard.boardState;

        return this;
    }

    /**
     * Sets the ship only if the square is unknown
     * @param {number[] | number} position - An index or array starting at 0 as [x, y]
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only works if value is a ship type)
     * @returns {boolean} True if the ship was set, false if not
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     */
    softSetShip (position, value, pinned) {
        if (this.getShip(position).playType !== PLAY_TYPES.UNKNOWN) return false;

        this.setShip(position, value, pinned);
        return true;
    }

    /**
     * Converts a relative position to an absolute index
     * @param {number[]|number} position - An index or array starting at 0 as [x, y]
     * @param {number} relativePosition - The relative position
     * @returns {number|null} The absolute index or null if the square would be outside of the board
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
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
     * Get a square adjacent to the base square
     * @param {number[] | number} basePosition - An index or array starting at 0 as [x, y]
     * @param {number} relativePosition - The index relative to position
     * @returns {Ship} The relative ship
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     */
    getRelativeShip (basePosition, relativePosition) {
        const index = this.relativePositionToIndex(basePosition, relativePosition);
        return (index !== null) ? this.boardState[index] : null;
    }

    /**
     * Set a square adjacent to the base square
     * @param {number[]|number} position - An index or array starting at 0 as [x, y]
     * @param {number} relativePosition - The index relative to position
     * @param {Ship|number} value - The ship object or type
     * @param {boolean} [pinned] - Should updateGraphicalTypes ignore the ship (only if value is a ship type)
     * @returns {BoardBuilder|undefined} this
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
     */
    setRelativeShip (position, relativePosition, value, pinned) {
        const index = this.relativePositionToIndex(position, relativePosition);

        if (index === null) return null;

        return this.setShip(index, value, pinned);
    }

    // make this automatically infer the relative position from a ship type -TODO
    /**
     * Sets all surrounding squares to water
     * @param {number | number[]} position - An index or array starting at 0 as [x, y]
     * @param {number} [except] - A relative position to set to a ship instead of water
     * @returns {BoardBuilder} this
     * @throws {RangeError} If position is not within the board
     * @throws {TypeError} If position is not an index (integer) or array of coordinates
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
     * @param {number[] | number} position - An index or array starting at 0 as [x, y]
     * @param {number} orientation - GRAPHICAL.HORIZONTAL or .VERTICAL
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
     * Flood the column with the given type or water, only setting unknown ships
     * @param {number} column - The target column's index
     * @param {number} [type] - What to flood it with (defaults to water)
     * @returns {BoardBuilder} this
     */
    softFloodColumn (column, type) {
        for (let y = 0; y < this.height; y++) {
            this.softSetShip([column, y], type ?? PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Flood the row with the given type or water, only setting unknown ships
     * @param {number} row - The target row's index
     * @param {number} [type] - What to flood it with (defaults to water)
     * @returns {BoardBuilder} this
     */
    softFloodRow (row, type) {
        for (let x = 0; x < this.width; x++) {
            this.softSetShip([x, row], type ?? PLAY_TYPES.WATER);
        }

        return this;
    }

    /**
     * Places water in all corners around a square
     * @param {number | number[]} position - An index or array starting at 0 as [x, y]
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
    BOTTOM_RIGHT: 8,
};

/**
 * Creates the boardState array
 * @param {number} width - The width of the board
 * @param {number} height - The height of the board
 * @param {BoardBuilder} [preset] - The board to copy
 * @returns {Ship[]} The board state
 */
function createBoardState (width, height, preset) {
    const out = [];

    for (let i = 0; i < width * height; i++) {
        if (preset) {
            const ship = preset.getShip(i);
            out.push(new Ship(ship.graphicalType, ship.pinned));
        } else {
            out.push(new Ship(PLAY_TYPES.UNKNOWN));
        }
    }

    return out;
}
