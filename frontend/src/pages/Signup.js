import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css'; 
import '../styles/eventor.css';
import axios from 'axios';
import { useAuth } from '../AuthContext';  

const SignUp = () => {
  const navigate = useNavigate();
  const { email, verifyId } = useAuth();

  const [formData, setFormData] = useState({
    email: email,
    verifyId : verifyId,
    userName: "",
    password: "",
    displayName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData); 
    axios.post("http://localhost:3001/api/user/signup", formData)
    .then(response => {
      console.log(response); 
      if (response.status === 200) {
        navigate("/home");
      }
    })
    .catch (err =>  {
      console.log(err);
      console.log(err)
    })
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
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
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
