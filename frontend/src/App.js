import './styles/App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Verify from './pages/Verify';
import Code from './pages/Code';
import Password from './pages/Password';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { AuthProvider } from './AuthContext'; 

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

const isAuthenticated = true;

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
      {/*<Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} /> */}
            
            <Route path="/" element={<Navigate to="/login" />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/code" element={<Code />} />

            <Route
              path="/home"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            
            <Route path="/password" element={<Password />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />

          </Routes>
        </BrowserRouter>

      </AuthProvider>
    </div>
  );
}

export default App;

