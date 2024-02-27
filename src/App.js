/* eslint-disable no-unused-vars */
import React from 'react';
import './App.css';
import Board from './Board/Board';
import BoardBuilder from './Board/BoardBuilder';
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Board/Ship';

// testing from brainbashers puzzle https://www.brainbashers.com/showbattleships.asp?date=0227&size=6&puzz=A
const preset = new BoardBuilder(6, 6)
    .setShip([1, 6], PLAY_TYPES.WATER, true)
    .setShip([5, 4], GRAPHICAL_TYPES.SINGLE, true);

class App extends React.Component {
    render () {
        return (
            <div className="App">
                <Board preset={preset} width={6} height={6} columnCounts={[1, 1, 4, 0, 4, 0]} rowCounts={[2, 2, 2, 1, 0, 3]}/>
            </div>
        );
    }
}

export default App;
