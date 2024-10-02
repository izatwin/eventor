import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Reset.css';
import '../styles/eventor.css';

/* Page for inputting email when resetting password */ 

const Reset = () => {
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
    navigate("/code");
  };



  return (
    <div className="reset-container">
      <div className="eventor-box">
        
        <form className="reset-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          <p className="reset-desc"> Forgot your password?  Enter your email to
reset your password.</p>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          
          <button type="submit" className="reset-btn">Continue</button>
        
        </form>

      <div className="reset-footer">
        <p>New user? <a href="/signup">Sign up</a></p>
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Reset;
