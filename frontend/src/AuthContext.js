/**
 * AuthContext.js
 *
 * This file defines an authentication context for the app.
 * It provides global state management for user authentication status, user details, 
 * and other related actions.
 *
 * - AuthProvider: Wraps the component and provides related state and actions to all children.
 * - useAuth: A hook to access context data. 
 *
 * Usage: Wrap the App with <AuthProvider> 
 * and access the context using the useAuth() hook in child components.
 */ 

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [action, setAction] = useState('');
  const [email, setEmail] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [user, setUser] = useState({
    email: "",
    displayName: "",
    userName: "",
    userId : "",
    status: "",
    bio: "",
    password: "",
  });

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, action, setAction, email, setEmail, verifyId, setVerifyId, user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
