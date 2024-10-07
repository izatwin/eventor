import React from "react";
import "./ProfilePopup.css"; 
import { useNavigate } from 'react-router-dom';

const ProfilePopup = ({ showPopup, onClose }) => {
  if (!showPopup) return null;
  
  const navigate = useNavigate;

  const handleSignout = () => {
    console.log("here");
    navigate('/');
  }
  return (
    <div className="popup-container">
      <div className="popup">
        <button className="popup-item">Settings</button>
        <button onClick={console.log('yo')} className="popup-item">Sign out</button>
      </div>
      <div className="overlay" onClick={onClose}></div> {}
    </div>
  );
};

export default ProfilePopup;

