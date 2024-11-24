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
            return <img src="./ships/single.svg" alt="Single"/>
        case GRAPHICAL_TYPES.UP:
            return <img src="./ships/end.svg" alt="Up" style={{ transform: "rotate(90deg)" }}/>
        case GRAPHICAL_TYPES.RIGHT:
            return <img src="./ships/end.svg" alt="Right" style={{ transform: "rotate(180deg)" }}/>
        case GRAPHICAL_TYPES.LEFT:
            return <img src="./ships/end.svg" alt="Left"/>
        case GRAPHICAL_TYPES.DOWN:
            return <img src="./ships/end.svg" alt="Down" style={{ transform: "rotate(-90deg)" }}/>
        case GRAPHICAL_TYPES.SHIP:
            return <img src="./ships/ship.svg" alt="Ship"/>
        case GRAPHICAL_TYPES.HORIZONTAL:
            return <img src="./ships/vertical-horizontal.svg" alt="Vertical/Horizontal"/>
        case GRAPHICAL_TYPES.VERTICAL:
            return <img src="./ships/vertical-horizontal.svg" alt="Vertical/Horizontal"/>
        case GRAPHICAL_TYPES.WATER:
            return <img src="./ships/water.svg" alt="Water"/>
        default:
            return <img alt=""/>;
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
