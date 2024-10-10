import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Verify.css';
import '../styles/eventor.css';

/* Page for inputting email when verifying */ 

const Verify = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email : "",
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
    <div className="verify-container">
      <div className="eventor-box">
        
        <form className="verify-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          <p className="verify-desc"> Enter your email.</p>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          
          <button type="submit" className="verify-btn">Continue</button>
        
        </form>

      <div className="verify-footer">
        <p>New user? <a href="/signup">Sign up</a></p>
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Verify;
