/* 
 * Login.js
 *
 * This component handles the login functionality for the app.
 * 
 *
*/

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import '../styles/eventor.css';

import { useAuth } from '../AuthContext'; 


axios.defaults.withCredentials = true;

const Login = () => {
  
  const navigate = useNavigate();
  const { setAction, setUser, setAuthenticated } = useAuth();  
  

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });


  useEffect(() => {
    
    const test = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/user/validate") 
          console.log(response);
          if (response.status === 200) {
            console.log(response.data['user-info']);
            setUser({    
              email: response.data["user-info"].email,
              displayName: response.data["user-info"].displayName,
              userName: response.data["user-info"].userName,
              userId : response.data["user-info"].userId}) 
            setAuthenticated(true);
            console.log("navigating");
            navigate("/home");
            return;
          }
          else {
            navigate("/");
          }
      } catch (err) {
        console.log("err");
        console.log(err)
      }
    }

    test();

  }, [])


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log(formData);

    axios.post("http://localhost:3001/api/user/login", formData)
    .then(response => {
      console.log(response);
      if (response.status === 200) {
       setUser({
          email: response.data.email, 
          displayName: response.data.displayName,
          userName: response.data.userName,
        });
        console.log("SETTING TRUE");
        setAuthenticated(true);
        navigate("/home");
      }
    })
    .catch (err =>  {
      console.log("err");
      console.log(err)
    })
  };

  const handleSignup = () => {
    setAction('signup');
    navigate("/verify");
  };

  const handlePassword = () => {
    setAction('resetPassword');
    navigate("/verify");
  };

  return (
    <div className="login-container">
      <div className="eventor-box">
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="eventor-title">EVENTOR</h1>
          <p className="eventor-subtitle">Post. Meet. Share</p>
          
          <input 
            type="text"
            name="email"
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
          />
          <input 
            type="password"
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
          />
          
          <button type="submit" className="login-btn">Login</button>
        
        </form>

      <div className="login-footer">
        <p>New user? <a onClick={handleSignup}>Sign up</a></p>
        <p><a onClick={handlePassword}>Forgot Password?</a></p>
      </div>

    </div>
  </div>
  );
};

export default Login;
