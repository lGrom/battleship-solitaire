import React from "react";
import {Ship, PLAY_TYPES} from "./Ship";

export default class Board extends React.Component {
    constructor (props) {
        super(props);

        const defaultWidth = 4;
        const defaultHeight = 4;

        // asign width and height if present, else use defaults
        if (this.props) {
            if (
                (this.props.width ||
                this.props.height) &&
                typeof this.props.width == 'number' &&
                typeof this.props.height == 'number' &&
                Number.isInteger(this.props.width) &&
                Number.isInteger(this.props.height) &&
                this.props.width > 0 &&
                this.props.height > 0
            ) {
                this.width = this.props.width || defaultWidth;
                this.height = this.props.height || defaultHeight;
            } else {
                throw new Error('Invalid input: width and height must be positive integers')
            }
        } else {
            this.width = defaultWidth;
            this.height = defaultHeight;
        }

        let tmpBoard = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                tmpBoard.push(new Ship(PLAY_TYPES.UKNOWN));
            }
        }

        this.state = {
            board: tmpBoard,
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
        return (x - 1) + (y * (this.width - 1) - 1);
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @returns {Number}
     */
    positionToIndex (position) {
        if (typeof position === 'number') return position;
        if (Array.isArray(position)) return this.coordinatesToIndex(position);
        throw new Error('Invalid input: position must be an index or array of coordinates');
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @returns {Ship}
     */
    getShip (position) {
        const index = this.positionToIndex(position);
        return this.state.board[index];
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @param {Ship} value
     * @returns {Board} this
     */
    setShip (position, value) {
        const index = this.positionToIndex(position);

        if (!(value instanceof Ship)) throw new Error('Invalid input: value must be instance of ship');

        let tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.setState({
            board: tmpBoard,
        });

        return this;
    }

    /**
     * Converts a relative position to an absolute index
     * @param {Array<Number>|Number} - An index or array starting at 1 as [x, y]
     * @param {Number} relativeIndex - The index relative to position
     * @returns {Number} The absolute index
     */
    relativePositionToIndex (position, relativePosition) {
        // rp is short for relative position
        const rp = Math.floor(relativePosition);
        const offset = rp % 3 + Math.floor(rp/3 - 1) * this.width;
        const index = this.positionToIndex(position) + offset;

        if (index < 0 || index > this.width * this.height - 1) return null;
        return index;
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} relativePosition - The index relative to position
     * @returns {Ship}
     */
    getRelativeShip (position, relativePosition) {
        const index = this.relativePositionToIndex(position, relativePosition);
        return (index !== null) ? this.state.board[index] : null;
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @param {Number} relativePosition - The index relative to position
     * @param {Ship} value
     * @returns {Board} this
     */
    setRelativeShip (position, relativePosition, value) {
        const index = this.relativePositionToIndex(position, relativePosition);

        if (!(value instanceof Ship)) throw new Error('Invalid input: value must be instance of ship');
        if (index === null) throw new Error('Index is not within board dimensions')

        let tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.setState({
            board: tmpBoard,
        });

        return this;
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

export const RealtivePositions = {
    TOP_LEFT: 0,
    TOP: 1,
    TOP_RIGHT: 2,
    LEFT: 3,
    // CENTER: 4, (this)
    RIGHT: 5,
    BOTTOM_LEFT: 6,
    BOTTOM: 7,
    BOTTOM_RIGHT: 8,
}