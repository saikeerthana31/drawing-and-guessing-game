const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

const PORT = 12345;

app.use(cors()); // Enable CORS for all routes
app.use(express.static('public')); // Serve static files if needed

let drawerAssigned = false;
let currentWord = ''; // The current word to guess
let leaderboard = {}; // Store points for each user
let connectedUsers = []; // Track connected users

const words = ["Sun", "Tree", "House", "Car", "Ball", "Star", "Fish", "Cat", "Cup", "Apple"]; // List of random words

// Function to select a random word
const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    connectedUsers.push(socket.id); // Add the user to connected users

    // Assign drawer or guesser role when a player joins
    socket.on('joinGame', (callback) => {
        const role = drawerAssigned ? 'guesser' : 'drawer';

        if (role === 'drawer') {
            drawerAssigned = true; // Assign the role of drawer
            currentWord = getRandomWord(); // Set a new word for the game
            console.log(`Drawer assigned with word: ${currentWord}`);
            socket.emit('wordToDraw', currentWord); // Send the word to the drawer
        }
        callback(role); // Send the assigned role back to the client

        // Notify all users of the current leaderboard
        io.emit('updateLeaderboard', leaderboard);
    });

    // Handle drawing events from the drawer
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data); // Send to all clients except the sender
    });

    // Handle clear event
    socket.on('clear', () => {
        socket.broadcast.emit('clear'); // Send clear command to all clients
    });

    // Handle guess submissions from guessers
    socket.on('submitGuess', (guess) => {
        console.log(`User ${socket.id} guessed: ${guess}`);
        const correct = guess.toLowerCase() === currentWord.toLowerCase();

        if (correct) {
            // Award a point to the guesser
            leaderboard[socket.id] = (leaderboard[socket.id] || 0) + 1;

            // Notify all users that someone guessed correctly
            io.emit('correctGuess', { user: socket.id, guess });

            // Update leaderboard for all users
            io.emit('updateLeaderboard', leaderboard);

            // Assign a new word and notify the drawer
            currentWord = getRandomWord();
            io.to(socket.id).emit('wordToDraw', currentWord); // Send new word to the drawer
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove the user from the leaderboard if they were a guesser
        delete leaderboard[socket.id];

        // Remove the user from connected users
        connectedUsers = connectedUsers.filter(user => user !== socket.id);

        // If the drawer disconnects, reset drawerAssigned
        if (!drawerAssigned) {
            drawerAssigned = false;
        }

        // Update leaderboard for all remaining users
        io.emit('updateLeaderboard', leaderboard);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
