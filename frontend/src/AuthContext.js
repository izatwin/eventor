import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [action, setAction] = useState('');
  const [email, setEmail] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [user, setUser] = useState({
    email: "",
    displayName: "",
    userName: "",
  });
  /*
  // Mock authentication function (replace with real API call)
  const login = (username, password) => {
    // Replace this with actual logic (e.g., fetch API)
    if (username === 'user' && password === 'pass') {
      setIsAuthenticated(true);
      setUser({ username }); // Set user information if needed
      return true;
    }
    return false;
  };
*/

  return (
    <AuthContext.Provider value={{ isAuthenticated, action, setAction, email, setEmail, verifyId, setVerifyId, user, setUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
