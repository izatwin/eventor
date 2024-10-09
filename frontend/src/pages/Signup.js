import React, { useState } from "react";
import '../styles/Signup.css'; 
import '../styles/eventor.css';

/* Page for signing up */ 

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData); 
  };

  return (
    <div className="signup-container">
      <div className="eventor-box">
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share.</p>
          
          <input
            type="text"
            name="displayName"
            placeholder="Display Name"
            value={formData.displayName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <div className="signup-footer"> 
          <p>Already a user? <a href="/">Login</a></p>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
