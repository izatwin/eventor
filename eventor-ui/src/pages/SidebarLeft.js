import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/SidebarLeft.css';
import homeIcon from './icons/home.png'; 
import exploreIcon from './icons/explore.png'; 
import userIcon from './icons/user.png'; 
import profilePic from './icons/profile.png'; 
import menuIcon from './icons/menu.png';


const SidebarLeft = () => {
  const [isProfilePopupVisible, setProfilePopupVisible] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setProfilePopupVisible(!isProfilePopupVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setProfilePopupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);


  const handleSignout = () => {
    navigate('/');
  }
  return (
    <div className="sidebar-left">
      <div className="home-title"> EVENTOR </div>
      
      <div className="home-icon">
        <img onClick={()=>navigate("/home")} src={homeIcon} alt="Home" className="icon-left" />
        <span className="dot"></span>
      </div>
      <div className="explore-icon">
        <img src={exploreIcon} alt="Explore" className="icon-left" />
      </div>
      <div className="user-icon">
        <img src={userIcon} alt="User" className="icon-left" />
      </div>

      {}
      <img onClick={handleProfileClick }src={menuIcon} alt="Menu" className="menu-icon" />
      <div className="profile">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <div className="profile-name">Suga Sean</div>
          <div className="profile-username">@sugasean2</div>
        </div>
      </div>

      {}
      {isProfilePopupVisible && (
        <div className="profile-popup" ref={popupRef}>
          <button onClick={()=>navigate("/settings")} className="popup-item">Settings</button>
          <button onClick={handleSignout} className="popup-item">Sign out</button>
        </div>
      )}

    </div>
  );
};

export default SidebarLeft;

