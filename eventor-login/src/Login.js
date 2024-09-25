import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">EVENTOR</h1>
        <p className="login-subtitle">Post. Meet. Share</p>
        <form>
          <input type="text" placeholder="Username" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <div className="login-footer">
          <p>New user? <a href="#">Sign up</a></p>
          <p><a href="#">Forgot Password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
