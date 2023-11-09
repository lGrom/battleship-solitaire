import React from 'react';
import './App.css';
import Board from './Board/Board';
// import Board from './Board/Board'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Board/>
      </div>
    );
  }
}

export default App;
