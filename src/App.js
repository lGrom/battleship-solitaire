/* eslint-disable no-unused-vars */
import React from 'react';
import './App.css';
import Board from './Board/Board';
import BoardBuilder from './Board/BoardBuilder';
import Ship, { PLAY_TYPES } from './Board/Ship';

const preset = new BoardBuilder(4, 4).setShip([1, 3], PLAY_TYPES.SHIP).setShip([3, 1], PLAY_TYPES.WATER);

class App extends React.Component {
    render () {
        return (
            <div className="App">
                <Board preset={preset} />
            </div>
        );
    }
}

export default App;
