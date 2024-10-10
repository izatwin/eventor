import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Password.css';
import '../styles/eventor.css';

/* Page for inputting new password */ 

const Password= () => {
const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confPassword: "",
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
    <div className="password-container">
      <div className="eventor-box">
        
        <form className="password-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          <p className="password-desc"> Enter your new password</p>
          <input 
            type="password"
            name="password"
            placeholder="New Password" 
            value={formData.password}
            onChange={handleChange}
          />
          <input 
            type="password"
            name="confPassword"
            placeholder="Confirm New Password" 
            value={formData.confPassword}
            onChange={handleChange}
          />
          <button type="submit" className="password-btn">Continue</button>
        
        </form>

      <div className="reset-footer">
        <p>New user? <a href="/signup">Sign up</a></p>
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Password;
