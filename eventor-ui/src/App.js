import './styles/App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Reset from './pages/Reset';
import Code from './pages/Code';
import Password from './pages/Password';
import Settings from './pages/Settings';
import Profile from './pages/Profile';


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
          <Route path="/reset" element={<Reset />} />
          <Route path="/code" element={<Code />} />
          <Route path="/password" element={<Password />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          {isAuthenticated ? (
            <Route path="/home" element={<Home />} />
          ) : (
            <Route path="/" element={<Login />} /> // Redirect to login if not authenticated
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

