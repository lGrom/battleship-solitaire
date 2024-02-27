import React from 'react';
import './Board.css';
import BoardBuilder from './BoardBuilder';

/**
 * The visible board
 * @param {Number} width Width in squares
 * @param {Number} height Height in squares
 * @param {BoardBuilder} [preset] Pre-existing ships
 * @param {BoardBuilder} [solution] Ending board (leave undefined if using vert/hoz count and shipsLeft)
 * @param {Number[]} [columnCounts] Number of ships in each column (left to right)
 * @param {Number[]} [rowCounts] Number of ships in each row (top to bottom)
 * @param {Number[]} [shipsLeft] Number of each type of ship left (eg. 3 solos and 1 double = [3, 1])
 */
export default class Board extends React.Component {
    constructor (props) {
        super(props);

        // ill fidle with the react stuff later. for now, I'll add pre-existing ships to BoardBuiler
        this.state = {
            board: new BoardBuilder(this.props.width, this.props.height, this.props.preset, undefined, this.props.columnCounts, this.props.rowCounts, this.props.shipsLeft)
        };
    }

    solveBoard () {
        this.setState({ board: BoardBuilder.solve(this.state.board) });
    }

    handleClick (event, index) {
        if (event.button === 0 || event.button === 2) {
            const ship = this.state.board.getShip(index);
            // this makes it +1 for left click and +2 for right click (which basically works as -1, but without making it negative)
            const newType = (ship.playType + 1 + event.button / 2) % 3;
            ship.setPlayType(newType);
            this.setState({ board: this.state.board.setShip(index, ship) });
        }

        this.state.board.computeGraphicalTypes();
    }

    displayBoard () {
        return this.state.board.boardState.map((ship, index) => {
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
            <>
                <div className="Board">
                    {this.displayBoard()}
                </div>
                <button onClick={() => { this.solveBoard(); }}>
                    Solve
                </button>
            </>
        );
    }
}
