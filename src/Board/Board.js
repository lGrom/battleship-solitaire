import React from 'react';
import Ship, { PLAY_TYPES } from './Ship';
import './Board.css';
import BoardBuilder from './BoardBuilder';

export default class Board extends React.Component {
    constructor (props) {
        super(props);

        // ill fidle with the react stuff later. for now, I'll add pre-existing ships to BoardBuiler
        this.state = {
            board: new BoardBuilder(this.props.width, this.props.height),
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
        return this.state.board[index];
    }

    /**
     * @param {Array<Number>|Number} position - An index or array starting at 1 as [x, y]
     * @param {Ship} value
     * @returns {Board} this
     */
    setShip (position, value) {
        // make this work with playtypes instead of a full ship object
        const index = this.positionToIndex(position);

        if (!(value instanceof Ship)) throw new Error('Invalid input: value must be instance of ship');

        const tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.setState({
            board: tmpBoard
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
        const index = this.positionToIndex(position);

        // prevent wrap-around on the sides
        if (index % this.width === 0 && relativePosition % 3 === 0) return null;
        if (index % this.width === this.width - 1 && relativePosition % 3 === 2) return null;

        const absIndex = (index) + ((Math.floor(rp / 3) - 1) * this.width) + (rp % 3 - 1);

        // check absIndex is within the board
        if (absIndex < 0 || absIndex > this.width * this.height - 1) return null;

        return absIndex;
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
        if (index === null) throw new Error('Index is not within board dimensions');

        const tmpBoard = this.state.board;
        tmpBoard[index] = value;
        this.setState({
            board: tmpBoard
        });

        return this;
    }

    handleClick (event, index) {
        if (event.button === 0 || event.button === 2) {
            const ship = this.getShip(index);
            // this makes it +1 for left click and +2 for right click (which basically works as -1)
            const newType = (ship.playType + 1 + event.button / 2) % 3;
            ship.setPlayType(newType);
            this.setShip(index, ship);
        }
    }

    displayBoard () {
        return this.state.board.map((ship, index) => {
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

    render () {
        return (
            <div className="Board">
                {this.displayBoard()}
            </div>
        );
    }
}

export const RelativePositions = {
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
