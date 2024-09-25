import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import "./DrawingApp.css";
const socket = io("http://192.0.0.2:12345"); // Use your server's IP

const words = ["Sun", "Tree", "House", "Car", "Ball", "Star", "Fish", "Cat", "Cup", "Apple"]; // List of random words

const DrawingApp = () => {
  const canvasRef = useRef(null);
  const [lineWidth, setLineWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [randomWord, setRandomWord] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";

    // Fill the canvas with a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let isDrawing = false;

    const getCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      isDrawing = true;
      ctx.beginPath();
      const { x, y } = getCoordinates(e);
      ctx.moveTo(x, y);
      socket.emit("drawing", { x, y, lineWidth, strokeColor });
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      socket.emit("drawing", { x, y, lineWidth, strokeColor });
    };

    const stopDrawing = () => {
      isDrawing = false;
      ctx.closePath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Handle clear event
    socket.on("clear", () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      socket.off("clear");
    };
  }, [lineWidth, strokeColor]);

  // Get random word for the drawer
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setRandomWord(words[randomIndex]);
    socket.emit("new word", words[randomIndex]); // Send the word to the server
  }, []);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 800, 600);
    socket.emit("clear"); // Emit clear event to clear all clients' canvases
  };

  return (
    <section className="container">
      <div className="wrapper">
        <div id="toolbar">
          <h1>Draw: {randomWord}</h1>
          <label htmlFor="stroke">Stroke</label>
          <input
            id="stroke"
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
          />
          <label htmlFor="lineWidth">Line Width</label>
          <input
            id="lineWidth"
            type="number"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
          <button onClick={clearCanvas}>Clear</button>
        </div>
        <div className="drawing-board">
          <canvas ref={canvasRef} id="drawing-board"></canvas>
        </div>
      </div>
    </section>
  );
};

export default DrawingApp;
