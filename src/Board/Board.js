import React from 'react';
import './Board.css';
import BoardBuilder from './BoardBuilder';

/**
 * The board component and all its parts
 * @param {Number} width
 * @param {Number} height
 * @param {BoardBuilder} preset - pre-existing ships
 */
export default class Board extends React.Component {
    constructor (props) {
        super(props);

        // ill fidle with the react stuff later. for now, I'll add pre-existing ships to BoardBuiler
        this.state = {
            board: new BoardBuilder(this.props.width, this.props.height, this.props.preset)
        };
    }

    handleClick (event, index) {
        if (event.button === 0 || event.button === 2) {
            const ship = this.state.board.getShip(index);
            // this makes it +1 for left click and +2 for right click (which basically works as -1)
            const newType = (ship.playType + 1 + event.button / 2) % 3;
            ship.setPlayType(newType);
            this.setState({ board: this.state.board.setShip(index, ship) });
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
