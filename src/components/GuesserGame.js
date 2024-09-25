import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://192.0.0.2:12345"); // Use your server's IP

const GuesserGame = () => {
  const canvasRef = useRef(null);
  const [guess, setGuess] = useState("");
  const [chat, setChat] = useState([]);
  const [leaderboard, setLeaderboard] = useState({}); // Change to an object for easier access

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    // Fill the canvas with a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Listen for drawing events
    socket.on("drawing", ({ x, y, lineWidth, strokeColor }) => {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    // Listen for clear events
    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FFFFFF"; // Refill with white background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Update leaderboard
    socket.on("updateLeaderboard", (data) => { // Update event name
      setLeaderboard(data); // Set the leaderboard directly
    });

    return () => {
      socket.off("drawing");
      socket.off("clear");
      socket.off("updateLeaderboard"); // Update event name
    };
  }, []);

  const submitGuess = () => {
    if (guess) {
      socket.emit("submitGuess", guess); // Ensure this matches server event name
      setGuess("");
    }
  };

  return (
    <div className="container">
      <h1>Guesser Game</h1>
      <div className="guess-section">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type your guess..."
        />
        <button onClick={submitGuess}>Submit Guess</button>
      </div>
      <div className="drawing-board">
        <canvas ref={canvasRef} id="drawing-board"></canvas>
      </div>
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <ul>
          {Object.entries(leaderboard).map(([userId, points]) => ( // Adjust to render object
            <li key={userId}>
              {userId}: {points} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GuesserGame;
