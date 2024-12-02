import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Verify.css';
import '../styles/eventor.css';
import axios from 'axios';

import { useAuth } from '../AuthContext';  
import { usePopup } from '../PopupContext';

/* Page for inputting email when verifying */ 

const Verify = () => {
  const navigate = useNavigate();
  const { action, verifyId, setVerifyId, email, setEmail } = useAuth();
  const { showFailPopup} = usePopup();

  const [formData, setFormData] = useState({
    email : "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault(); 
  console.log(formData);
  
  if (formData.email === "") {
    showFailPopup("Missing email!")
    return
  }

  let terminate = false;

  try {
    const response = await axios.get(process.env.REACT_APP_API_URL + `/api/user/${formData.email}/exists`);

    if (action === 'signup') {
      console.log(response.data.exists);
      if (response.data.exists) {
        terminate = true;
        console.log("a:", terminate);
        showFailPopup("This email is already registered!")
      }
    } else if (action === 'resetPassword') {
      if (!response.data.exists) {
        terminate = true;
        showFailPopup("This email does not exist!")
      }
    }

    if (terminate) {
      setFormData({email : ""});
      console.log('returning');
      return;
    }


    setEmail(formData.email);

    const verifyResponse = await axios.post(process.env.REACT_APP_API_URL + "/api/user/verify", formData);
    console.log(verifyResponse.data.verifyId);
    console.log(verifyResponse.data.verifyId);
    setVerifyId(verifyResponse.data.verifyId);
    navigate("/code");
    
  } catch (err) {
    console.log(formData);
    console.log("Error:", err);
    showFailPopup(err.response.data.message)
  }

  console.log("Completed the handleSubmit without terminating early");
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
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Verify;
