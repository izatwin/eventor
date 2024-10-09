import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import '../styles/eventor.css';

/* Page for logging in */ 

const Login = () => {
  
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData);
    navigate("/home");
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
        <p>New user? <a href="/signup">Sign up</a></p>
        <p><a href="/reset">Forgot Password?</a></p>
      </div>

    </div>
  </div>
  );
};

export default Login;
