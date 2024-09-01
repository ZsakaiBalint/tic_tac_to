import { useState } from "react";

// LEVEL 1 - JUNIOR
// FEATURES: game / gameboard / gamelogic / player / leaderbord / store
// Add redux store to the project
// Save all game logic and data to the browser or better to some db
// Update your function definitions to arrow functions and export them into its own features
// and import them into this App 
// Use react hooks ( bonus if you create custom hooks for each features )

// LEVEL 2 - MEDIOR
// add a main screen with form where I can enter a nickname and participate in the leaderboard
// check nickname validation ( google for form validation for react / redux )
// if nickname is available show a button and let me enter to a game against cpu
// postgreSQL for database
// choose a backend language

// LEVEL 3 - SENIOR
// JAVA Backend
// Add real-time server for your game over websockets and let it go multiplayer
// Create waiting room
// Add real-time chat
// Add eslint and pre-commits

// LEVEL 4 - TECH LEAD add documentation to your project, hotfix, blog, invite people to participate in open SourceBuffer

//value can be: "X"/"O"/null <-- no comments please use clean code instead
function Square({value, onSquareClick, isWinningSquare = false}) {
  
  return (
    <button 
      className={`square ${isWinningSquare ? "square-highlighted" : ""}`}
      onClick={onSquareClick}
    > 
      {value} 
    </button>
  );
}

function Board({xIsNext, squares, onPlay}) {

  function handleClick(i) {
    

    const hasWinner = calculateWinner(squares).winner !== null;
    if(squares[i] || hasWinner) {
      return;
    }
    

    const nextSquares = squares.slice();

    if(xIsNext) {
      nextSquares[i] = "X";
    }
    else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares).winner;
  const winnerCells = calculateWinner(squares).cells;
  const draw = !winner && !squares.includes(null);

  let gameStatus;
  if(winner) {
    gameStatus = "The winner is: " + winner +" Congratulations!";
  }
  else if(draw) {
    gameStatus = "This game is a draw!";
  }
  else {
    gameStatus = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{gameStatus}</div>

      {
        //extra assignment #2
        Array.from({ length : 3 }).map((_, row) => (
          <div key={row} className="board-row">
            {
              Array.from({ length : 3 }).map((_, col) => {
                const index = row * 3 + col;
                return (
                  <Square
                    key = {index}
                    value = {squares[index]}
                    onSquareClick = {() => handleClick(index)}
                    isWinningSquare = {winnerCells.includes(index)}
                  />
                );
              })
            }
          </div>
        ))
      }
    </>
  );
}

export default function Game() {
  /*
    //history is in the following format: 
    [
      [null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,"X",null,null],
      [null,"O",null,null,null,null,"X",null,null],
      ...
    ]
  */
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [historyOrderAsc, setHistoryOrderAsc] = useState(true);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = ([...history.slice(0, currentMove + 1), nextSquares]);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

//parameter index: which move you want to get
function getMoveFromHistory(history, index) {
    if(index <= 0 || index > history.length - 1) {
      throw new Error("Invalid argument: index");
    }

    const move = history[index];
    const previousMove = history[index-1];

    const notMatchingAtIndex = (element, index) => element !== previousMove[index];
    const diffIndex = move.findIndex(notMatchingAtIndex);

    return {"row": Math.floor(diffIndex / 3) + 1, "col": Math.floor(diffIndex % 3) + 1}
}

  const moves = history.map((squares, move) => {

    const isLastMove = move === history.length - 1;
    const isFirstMove = move === 0;

    if(isLastMove) {
      if(isFirstMove) {
        return (
          <li key={move}>
            You are at game start. Click on a cell to start playing!
          </li>
        )
      }
      return (
        <li key={move}>
          You are at move #{move}
        </li>
      )
    }

    let description;
    if(isFirstMove) {
      description = "Go to game start";
    }
    else {
      const row = getMoveFromHistory(history,move).row;
      const col = getMoveFromHistory(history,move).col;
      description = "Go to move #" + move + " => (" + row + ":" + col + ")";
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  });

  const toggleHistoryOrder = () => {
    setHistoryOrderAsc(!historyOrderAsc);
  }

  const sortedMoves = historyOrderAsc ? moves : moves.reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
      </div>
      <div className="game-info">
        <button onClick={toggleHistoryOrder}>Moves listed in: {historyOrderAsc ? "ascending" : "descending"} order</button>
        <ol reversed={!historyOrderAsc}>{sortedMoves}</ol>
      </div>
    </div>
  )
}

//calculate the winner and winning cells based on one element of the game's history
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], //first row
    [3, 4, 5], //second row
    [6, 7, 8], //third row
    [0, 3, 6], //first column
    [1, 4, 7], //second column
    [2, 5, 8], //third column
    [0, 4, 8], //diagonal from top left to bottom right
    [2, 4, 6]  //diagonal from bottom left to top right
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { "winner":squares[a], "cells": [a, b, c] };
    }
  }
  return { "winner": null, "cells": [] };

}
