import './App.css';
import Login from './Login';
import Signup from './Signup';
import Feed from './Feed';
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

const isAuthenticated = true;
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {isAuthenticated ? (
            <Route path="/feed" element={<Feed />} />
          ) : (
            <Route path="/" element={<Login />} /> // Redirect to login if not authenticated
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

