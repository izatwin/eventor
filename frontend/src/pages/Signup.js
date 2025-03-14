import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css'; 
import '../styles/eventor.css';
import axios from 'axios';
import { useAuth } from '../AuthContext';  
import { usePopup } from '../PopupContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { email, verifyId, setUser, setAuthenticated } = useAuth();
  const { showOffensivePopup, showFailPopup } = usePopup();
  
  const defaultForm = {
    email: email,
    verifyId : verifyId,
    userName: "",
    password: "",
    displayName: "",
  }
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData); 
    if (formData.displayName === "") {
      showFailPopup("Mising display name!")
      return
    }
    if (formData.userName === "") {
      showFailPopup("Mising username!")
      return
    }
    if (formData.password === "") {
      showFailPopup("Mising password!")
      return
    }
    axios.post(process.env.REACT_APP_API_URL + "/api/user/signup", formData)
    .then(response => {
      console.log(response); 
      if (response.status === 200) {
        setUser({
          email: response.data.email, 
          displayName: response.data.displayName,
          userName: response.data.userName,
        });
        setAuthenticated(true);
        navigate("/home");
      }
    })
    .catch (err =>  {
      if (err.response.status === 422) {
        showOffensivePopup("Your profile can't contain offensive or obscene content")
        setFormData(defaultForm)
      }
      else {
        showFailPopup(err.response.data.message)
      }
      console.log(err)
    })
  };

  useEffect(()=>{
    if (verifyId === "") {
      showFailPopup("Error accessing page!")
      navigate("/");
    }
  }, [])

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
        </div>

      </div>
    </div>
  );
};

export default SignUp;
