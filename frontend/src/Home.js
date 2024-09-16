import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import './Home.css';

const Home = () => {
  const [isVsPlayerSelected, setIsVsPlayerSelected] = useState(false);
  const socket = io("http://localhost:5000"); // Initialize socket connection
  const playerNameRef = useRef(null); // a ref for the input field

  const handleVsPlayerClick = () => {
    //frontend changes
    const playerName = document.getElementById("playerName").value;
    if(!playerName) {
      return;
    }
    setIsVsPlayerSelected(true);

    //backend changes
    socket.emit("findOpponent", { playerName });

    socket.on("serverMessage", (message) => {
      console.log("Message from server:", message);
      if (message.includes("is taken!")) {
        alert(`${playerName} is already taken! Please choose a different name.`);
        playerNameRef.current.value = "";
        setIsVsPlayerSelected(false);
      }
    });

  };

  return (
    <>
        <h1>🕹️ Tic Tac Toe with time travel 🕹️</h1>
        <h2>Welcome to the Home Page!</h2>

        <div className='margin-top'>
          <h2>First, hoose a name:</h2>
          <input 
            id="playerName" 
            ref={playerNameRef}
            type='text' 
            className="input-large" 
            placeholder="Player1212532"
            readOnly={isVsPlayerSelected}
            >
          </input>
          
          <h2>Second, choose a game-mode:</h2>
          <ul>
            <li><button onClick={handleVsPlayerClick}>VS Player</button></li>
            <li><button disabled={isVsPlayerSelected} className={isVsPlayerSelected ? 'hidden' : ''}>VS Computer</button></li>
          </ul>
        </div>

        {/* Show this section only when VS Player is selected */}
        {isVsPlayerSelected && (
          <div>
            <img src="loading.gif" alt="loading"></img>
            <div className="text-center">
              <DynamicHeading text="Searching for other players" />
            </div>
          </div>
        )}
    </>
  )
};

export default Home;





function DynamicHeading({ text }) {
  const [dots, setDots] = useState(""); // State to hold the current number of dots

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length < 3) {
          return prevDots + "."; // Add a dot if less than 3 dots
        } else {
          return ""; // Reset dots to empty after reaching 3 dots
        }
      });
    }, 500); // Change every 500ms

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []); // Empty dependency array to run the effect only once when the component mounts

  return <h2 className="fixed-width-heading">{text}{dots}</h2>;
}