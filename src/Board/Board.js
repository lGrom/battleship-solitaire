import React from 'react';
import './Board.css';
import BoardBuilder from './BoardBuilder';
import { GRAPHICAL_TYPES } from './Ship';

/**
 * The visible board
 * @param {number} width - Width in squares
 * @param {number} height - Height in squares
 * @param {BoardBuilder} [preset] - Pre-existing ships
 * @param {BoardBuilder} [solution] - Ending board (leave undefined if using vert/hoz count and shipsLeft)
 * @param {number[]} [columnCounts] - Number of ships in each column (left to right)
 * @param {number[]} [rowCounts] - Number of ships in each row (top to bottom)
 * @param {number[]} [shipsLeft] - Number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
 */
export default class Board extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            board: new BoardBuilder(this.props.width, this.props.height, this.props.preset, undefined, this.props.columnCounts, this.props.rowCounts, this.props.runs)
        };
    }

    solveBoard () {
        this.setState({ board: BoardBuilder.solve(this.state.board) });
    }

    handleClick (event, index) {
        const ship = this.state.board.getShip(index);

        if (ship.pinned) return;

        if (event.button === 0 || event.button === 2) {
            // this makes it +1 for left click and +2 for right click (which basically works as -1, but without making it negative)
            const newType = (ship.playType + 1 + event.button / 2) % 3;
            ship.setPlayType(newType);
            this.setState({ board: this.state.board.setShip(index, ship) });
        }

        this.state.board.computeGraphicalTypes();
    }

    svgObjectFromType (type) {
        switch (type) {
        case GRAPHICAL_TYPES.SINGLE:
            return <object type="image/svg+xml" data="./ships/single.svg">Up</object>;
        case GRAPHICAL_TYPES.UP:
            return <object type="image/svg+xml" data="./ships/end.svg">Up</object>;
        case GRAPHICAL_TYPES.RIGHT:
            return <object type="image/svg+xml" data="./ships/end.svg">Right</object>;
        case GRAPHICAL_TYPES.LEFT:
            return <object type="image/svg+xml" data="./ships/end.svg">Left</object>;
        case GRAPHICAL_TYPES.DOWN:
            return <object type="image/svg+xml" data="./ships/end.svg">Down</object>;
        case GRAPHICAL_TYPES.SHIP:
            return <object type="image/svg+xml" data="./ships/ship.svg">Ship</object>;
        case GRAPHICAL_TYPES.HORIZONTAL:
            return <object type="image/svg+xml" data="./ships/vertical-horizontal.svg">Vertical/Horizontal</object>;
        case GRAPHICAL_TYPES.VERTICAL:
            return <object type="image/svg+xml" data="./ships/vertical-horizontal.svg">Vertical/Horizontal</object>;
        case GRAPHICAL_TYPES.WATER:
            return <object type="image/svg+xml" data="./ships/water.svg">Water</object>;
        default:
            return <object/>;
        }
    }

    displayBoard () {
        return this.state.board.boardState.map((ship, index) => {
            return <div
                className="Square nohighlight"
                key={index}
                onMouseUp={(event) => this.handleClick(event, index)}
                onContextMenu={(e) => e.preventDefault()}
            >
                {this.svgObjectFromType(ship.graphicalType)}
            </div>;
        });
    }

    render () {
        return (
            <>
                <div className="Board" style={{ gridTemplate: `repeat(${this.props.width}, 50px) / repeat(${this.props.height}, 50px)` }}>
                    {this.displayBoard()}
                </div>
                <button onClick={() => { this.solveBoard(); }}>
                    Solve
                </button>
            </>
        );
    }
}
