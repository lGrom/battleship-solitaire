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
     * @param {Array<Number>|Number} position - Starts at 1 as [x, y] or use index
     * @param {Ship} value
     */
    setShip (position, value) {
        let index;

        if (Array.isArray(position)) index = this.coordinatesToIndex(position);
        else if (typeof position === 'number') index = position;
        else throw new Error('Invalid input: position must be an index or array of coordinates');

        if (!(value instanceof Ship)) throw new Error('Invalid input: value must be instance of ship')

        let tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.setState({
            board: tmpBoard,
        });
    }

    /**
     * @param {Array<Number>|Number} position - Starts at 1 as [x, y] or use index
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
     * @param {Array<Number>} coordinates - Starts at 1 - [x, y]
     * @returns {Number}
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