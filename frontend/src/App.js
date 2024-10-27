/**
 * App.js
 *
 * This file sets up the main structure of the React app.
 *
 * - Routes: Defines the available routes and maps them to their respective components.
 * 
 */

import './styles/App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Verify from './pages/Verify';
import Code from './pages/Code';
import Password from './pages/Password';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Post from './pages/Post';
import Discover from './pages/Discover';

import { AuthProvider } from './AuthContext'; 
import { PopupProvider } from './PopupContext'; 

import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
    <PopupProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/code" element={<Code />} />

            <Route path="/password" element={<Password />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post/:_id" element={<Post />} />
            <Route path="/discover" element={<Discover />} />

            // <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </BrowserRouter>

      </AuthProvider>
      </PopupProvider>
    </div>
  );
}

export default App;
