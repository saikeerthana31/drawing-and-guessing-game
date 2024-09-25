import React, { useState } from "react";
import "./StartPage.css";
import io from "socket.io-client";

const socket = io("http://192.0.0.2:12345");


const StartPage = ({ onStartGame }) => {
    const [username, setUsername] = useState("");

    const handlePlay = () => {
        console.log("Play button clicked");
        if (username) {
            socket.emit("joinGame", (role) => {
                console.log("Role assigned:", role);
                onStartGame(role); // Pass the assigned role to the game start function
            });
        } else {
            console.log("Username is required");
        }
    };

    return (
        <div className="container">
            <div className="logo">DRAWING GUESS</div>
            <div className="avatar-section">
                {/* Avatar UI */}
            </div>
            <div className="input-section">
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
                <select>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                </select>
            </div>
            <button className="button" onClick={handlePlay}>
                Play!
            </button>
            <br />
            <button className="button button-secondary">Create Private Room</button>
        </div>
    );
};

export default StartPage;
