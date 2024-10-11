import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../AuthContext';
import '../styles/Code.css';
import '../styles/eventor.css';
import axios from 'axios'

/* Page for the user to input their 6 digit code */ 

const Code = () => {
  const navigate = useNavigate();
  const { action, email, verifyId, setVerifyId } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [formData, setFormData] = useState({
    email : email,
    verifyId : verifyId,
    verifyCode : "",
  });

  const handleChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      verifyCode: newCode.join(''),     
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log("a: " + formData.verifyId);
    console.log(formData);
    axios.patch("http://localhost:3001/api/user/verify", formData)
    .then(response => {
      console.log(response);
      if (response.status === 200) {
        if (action === 'signup') {
          navigate('/signup'); 
        } else if (action === 'resetPassword') {
          navigate('/password'); 
        }
      }
      if (response.verifyId === null) {
        setFormData({
        email : email,
        verifyId : verifyId,
        verifyCode : "",
      });
      }
    })
    .catch (err =>  {

      console.log(err)
    })



  };

  return (
    <div className="code-container">
      <div className="eventor-box">
        
        <form className="code-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          <p className="code-desc"> Enter your 6-digit code to verify your account</p>
          

          <div className="input-container">
            <div className="input-boxes">
              {code.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="code-input"
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </div>
          </div>

          <div className="btn-container"> 
            <button onClick={handleSubmit} className="code-btn">Submit</button>
          </div>

        </form>

      <div className="code-footer">
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Code;
