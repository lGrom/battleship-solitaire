/* eslint-disable no-unused-vars */
import React from 'react';
import './App.css';
import Board from './Board/Board';
import BoardBuilder from './Board/BoardBuilder';
import Ship, { GRAPHICAL_TYPES, PLAY_TYPES } from './Board/Ship';

// https://www.brainbashers.com/showbattleships.asp?date=0227&size=6&puzz=A
// const preset = new BoardBuilder(6, 6)
//     .setShip([1, 6], PLAY_TYPES.WATER, true)
//     .setShip([5, 4], GRAPHICAL_TYPES.SINGLE, true);

// columnCounts={[1, 1, 4, 0, 4, 0]} rowCounts={[2, 2, 2, 1, 0, 3]

// const preset = new BoardBuilder(12, 12).setShip(3, 1, false).setShip(9, 6, false).setShip(10, 9, false).setShip(13, 2, false).setShip(23, 1, false).setShip(27, 1, false).setShip(31, 1, false).setShip(68, 1, false).setShip(72, 1, false).setShip(73, 1, false).setShip(74, 1, false).setShip(84, 1, false).setShip(85, 3, false).setShip(86, 1, false).setShip(90, 1, false).setShip(91, 5, false).setShip(92, 9, false).setShip(94, 1, false).setShip(95, 1, false).setShip(96, 1, false).setShip(97, 1, false).setShip(98, 1, false).setShip(106, 1, false).setShip(107, 3, false).setShip(118, 1, false).setShip(119, 1, false).setShip(126, 1, false).setShip(127, 5, false).setShip(128, 9, false);
// columnCounts={[0, 3, 1, 3, 1, 1, 5, 2, 2, 3, 3, 3]} rowCounts={[2, 5, 1, 5, 1, 1, 3, 4, 1, 0, 3, 1]}

// https://www.brainbashers.com/showbattleships.asp?date=0607&size=15&puzz=A
const preset = new BoardBuilder(15, 15)
    .setShip([4, 1], GRAPHICAL_TYPES.SHIP, true)
    .setShip([7, 1], GRAPHICAL_TYPES.WATER, true)
    .setShip([2, 3], GRAPHICAL_TYPES.WATER, true)
    .setShip([13, 3], GRAPHICAL_TYPES.SINGLE, true)
    .setShip([3, 4], GRAPHICAL_TYPES.LEFT, true)
    .setShip([6, 4], GRAPHICAL_TYPES.WATER, true)
    .setShip([11, 4], GRAPHICAL_TYPES.SHIP, true)
    .setShip([11, 5], GRAPHICAL_TYPES.VERTICAL, true)
    .setShip([13, 5], GRAPHICAL_TYPES.SINGLE, true)
    .setShip([3, 6], GRAPHICAL_TYPES.DOWN, true)
    .setShip([7, 7], GRAPHICAL_TYPES.SINGLE, true)
    .setShip([8, 7], GRAPHICAL_TYPES.WATER, true)
    .setShip([13, 7], GRAPHICAL_TYPES.WATER, true)
    .setShip([7, 8], GRAPHICAL_TYPES.WATER, true)
    .setShip([11, 8], GRAPHICAL_TYPES.WATER, true)
    .setShip([13, 8], GRAPHICAL_TYPES.WATER, true)
    .setShip([5, 9], GRAPHICAL_TYPES.SHIP, true)
    .setShip([10, 9], GRAPHICAL_TYPES.WATER, true)
    .setShip([3, 11], GRAPHICAL_TYPES.WATER, true)
    .setShip([7, 12], GRAPHICAL_TYPES.SHIP, true)
    .setShip([10, 12], GRAPHICAL_TYPES.SHIP, true)
    .setShip([15, 12], GRAPHICAL_TYPES.WATER, true)
    .setShip([3, 13], GRAPHICAL_TYPES.WATER, true)
    .setShip([4, 13], GRAPHICAL_TYPES.WATER, true)
    .setShip([8, 13], GRAPHICAL_TYPES.WATER, true)
    .setShip([10, 13], GRAPHICAL_TYPES.SHIP, true)
    .setShip([2, 14], GRAPHICAL_TYPES.UP, true)
    .setShip([7, 14], GRAPHICAL_TYPES.WATER, true)
    .setShip([4, 15], GRAPHICAL_TYPES.WATER, true)
    .setShip([15, 15], GRAPHICAL_TYPES.SINGLE, true)
    .computeGraphicalTypes();

class App extends React.Component {
    render () {
        return (
            <div className="App">
                <Board preset={preset} width={15} height={15} columnCounts={[0, 5, 6, 1, 5, 1, 5, 1, 0, 5, 3, 0, 2, 0, 1]} rowCounts={[2, 0, 1, 3, 4, 2, 3, 2, 4, 0, 4, 3, 3, 2, 2]}/>
            </div>
        );
    }
}

export default App;
