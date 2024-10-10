import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Code.css';
import '../styles/eventor.css';

/* Page for the user to input their 6 digit code */ 

const Code = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    /*username: "",
    password: "", */ 
    /* Handle 6 digit code */
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData);
    navigate("/password");
  };

  return (
    <div className="code-container">
      <div className="eventor-box">
        
        <form className="code-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          <p className="code-desc"> Enter your 6-digit code to verify your account</p>
          

          <div class="input-container">
            <input type="text" maxlength="1" class="code-input"/>
            <input type="text" maxlength="1" class="code-input"/>
            <input type="text" maxlength="1" class="code-input"/>
            <input type="text" maxlength="1" class="code-input"/>
            <input type="text" maxlength="1" class="code-input"/>
            <input type="text" maxlength="1" class="code-input"/>
          </div>
          
          <button type="submit" className="reset-btn">Continue</button>
        
        </form>

      <div className="code-footer">
        <p>New user? <a href="/signup">Sign up</a></p>
        <p>Already a user? <a href="/">Login</a></p>
      </div>

    </div>
  </div>
  );
};

export default Code;
