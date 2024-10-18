import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Password.css';
import '../styles/eventor.css';
import axios from 'axios'
import { useAuth } from '../AuthContext';  

/* Page for inputting new password */ 

const Password= () => {
  const navigate = useNavigate();
  const { action, verifyId, setVerifyId, email, setEmail } = useAuth();
  const [formData, setFormData] = useState({
    email : email,
    verifyId : verifyId,
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    console.log(formData);
    try {
      const response = await axios.post(`http://localhost:3001/api/user/reset`, formData);
      
      if (response.status === 200) {
        navigate("/home");
      }
      else {
        setFormData({
          email : email,
          verifyId : verifyId,
          newPassword: "",
        });
      }

      
    } catch (err) {
      console.log(formData);
      console.log("Error:", err);
    }
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
            name="newPassword"
            placeholder="New Password" 
            value={formData.newPassword}
            onChange={handleChange}
          />
 
          <button type="submit" className="password-btn">Continue</button>
        
        </form>

      <div className="password-footer">
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Password;
