import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';


import '../styles/Login.css';
import '../styles/eventor.css';

import { useAuth } from '../AuthContext'; 


/* Page for logging in */ 

const Login = () => {
  
  const navigate = useNavigate();
  const { setAction } = useAuth();  
  

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData);
    axios.post("http://localhost:3001/")
    .then(response => {
      console.log(response);
      navigate("/home");
    })
    .catch (err =>  {
      console.log(err)
    })
  };

  const handleSignup = () => {
    setAction('signup');
    navigate("/verify");
  };

  const handlePassword = () => {
    setAction('resetPassword');
    navigate("/verify");
  };

  return (
    <div className="login-container">
      <div className="eventor-box">
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          
          <input 
            type="text"
            name="username"
            placeholder="Username" 
            value={formData.username}
            onChange={handleChange}
          />
          <input 
            type="password"
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
          />
          
          <button type="submit" className="login-btn">Login</button>
        
        </form>

      <div className="login-footer">
        <p>New user? <a onClick={handleSignup}>Sign up</a></p>
        <p><a onClick={handlePassword}>Forgot Password?</a></p>
      </div>

    </div>
  </div>
  );
};

export default Login;
