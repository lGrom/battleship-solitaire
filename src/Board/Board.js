import React from "react";
import {Ship, PLAY_TYPES} from "./Ship";

class Board extends React.Component {
    constructor (props) {
        super(props);

        const defaultDimensions = [4, 4]
        if (this.props) {
            if (
                this.props.dimensions.length === 2 &&
                typeof this.props.dimensions[0] == 'number' &&
                typeof this.props.dimensions[1] == 'number' &&
                Number.isInteger(this.props.dimensions[0]) &&
                Number.isInteger(this.props.dimensions[1]) &&
                this.props.dimensions[0] > 0 &&
                this.props.dimensions[1] > 0
            ) {
                this.dimensions = this.props.dimensions;
            } else {
                throw new Error('Invalid input: dimensions should be 2 item long array of integers greater than zero')
            }
        } else {
            this.dimensions = defaultDimensions;
        }

        let tmpBoard = [];
        for (let i = 0; i < this.dimensions[0]; i++) {
            for (let j = 0; j < this.dimensions[1]; j++) {
                tmpBoard.push(new Ship(PLAY_TYPES.UKNOWN));
            }
        }

        this.state = {
            board: tmpBoard,
        }
    }

    /**
     * Replaces a ship with the supplied one
     * @param {Array<Number>|Number} position - Which square to change
     * @param {Ship} value - What to change the square to
     */
    setShip (position, value) {
        let index;

        if (Array.isArray(position)) index = this.coordinatesToIndex(position);
        else if (typeof position === 'number') index = position;
        else throw new Error('Invalid input: position must be an index or array of coordinates');

        if (!value instanceof Ship) throw new Error('Invalid input: value must be instance of ship')

        let tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.state.board = tmpBoard;
    }

    /**
     * Get a ship from its position
     * @param {Array<Number>|Number} position - The position to query
     * @returns {Ship}
     */
    getShip (position) {
        let index;

        if (Array.isArray(position)) index = this.coordinatesToIndex(position);
        else if (typeof position === 'number') index = position;
        else throw new Error('Invalid input: position must be an index or array of coordinates');

        return this.state.board[index];
    }

    /**
     * Convert a pair of coordinates to an index on the board
     * @param {Array<Number>} coordinates - The coordinates in the form [x, y] (starts at 1)
     * @returns {Number} The index
     */
    coordinatesToIndex (coordinates) {
        const [x, y] = coordinates;

        if (x > this.dimensions[0] || y > this.dimensions[1]) {
            throw new Error('Invalid input: coordinates must not exceed board dimensions');
        }

        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error('Invalid input: coordinates must be integers');
        }

        // paranthesis for legability 
        return (x - 1) + (y * (this.dimensions[0] - 1) - 1);
    }

    displayBoard () {
        return this.state.board.map((ship) => {return <p>{ship.toString()}</p>});
    }

    render () {
        return (
            <div> 
                {this.displayBoard()}
            </div>
        )
    }
}

export default Board;