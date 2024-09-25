// App.js
import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import StartPage from "./components/StartPage";
import Guesser from "./components/GuesserGame";
import Drawer from "./components/DrawingApp";

const App = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleStartGame = (selectedRole) => {
    setRole(selectedRole);
    navigate(`/${selectedRole}`); // Navigate to either /guesser or /drawer
  };

  return (
    <Routes>
      <Route exact path="/" element={<StartPage onStartGame={handleStartGame} />} />
      <Route path="/guesser" element={<Guesser />} />
      <Route path="/drawer" element={<Drawer />} />
    </Routes>
  );
};

export default App;
