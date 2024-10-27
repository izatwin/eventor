import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/SidebarLeft.css';
import homeIcon from './icons/home.png'; 
import exploreIcon from './icons/explore.png'; 
import userIcon from './icons/user.png'; 
import profilePic from './icons/profile.png'; 
import menuIcon from './icons/menu.png';
import axios from 'axios'
import { useAuth } from '../AuthContext'; 

const SidebarLeft = () => {
  const [isProfilePopupVisible, setProfilePopupVisible] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { user, setAuthenticated } = useAuth();  

  const handleProfileClick = () => {
    setProfilePopupVisible(!isProfilePopupVisible);
  };

  useEffect(() => {
    console.log(window.location.pathname.split('/')[1])
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
    axios.patch("http://localhost:3001/api/user/logout")
    .then(response => {
      console.log(response);
      if (response.status === 200) { 
        setAuthenticated(true);
        navigate("/");
      }
    })
    .catch (err =>  {
      console.log(err);
    })
  }
  return (
    <div className="sidebar-left">
      <div className="home-title"> EVENTOR </div>
      
      <div className="home-icon icon">
        <img 
          className="icon-left"
          onClick={()=>navigate("/home")} 
          src={homeIcon} 
          alt="Home" 
        />
        <span 
          className={`dot ${window.location.pathname.split('/')[1] === 'home' ? 'active' : ''}`}>
        </span>
      </div>

      <div className="explore-icon icon">
        <img 
          onClick={()=>navigate("/discover")} 
          src={exploreIcon} 
          alt="Explore" 
          className="icon-left" 
        />
        <span 
          className={`dot ${window.location.pathname.split('/')[1] === 'discover' ? 'active' : ''}`}>
        </span>
      </div>

      <div className="user-icon icon">
        <img 
          onClick={()=>navigate("/profile")} 
          src={userIcon} 
          alt="User" 
          className="icon-left" 
        />
        <span 
          className={`dot ${window.location.pathname.split('/')[1] === 'profile' ? 'active' : ''}`}>
        </span>
      </div>

      {}
      <div className="menu-icon icon">
        <img 
          onClick={handleProfileClick } 
          src={menuIcon} 
          alt="Menu" 
          className="icon-left" />
      </div>

      <div className="profile">
        <img 
          src={user.pfp || profilePic} 
          alt="Profile" 
          className="profile-pic" 
        />
        
        <div className="profile-info">
          <div className="profile-name">{user.displayName}</div>
          <div className="profile-username">@{user.userName}</div>
        </div>

      </div>

      {}
      {isProfilePopupVisible && (
        <div className="profile-popup" ref={popupRef}>
          <button onClick={()=>{
            navigate("/settings")
          }} className="popup-item">Settings</button>
          <button onClick={handleSignout} className="popup-item">Sign out</button>
        </div>
      )}

    </div>
  );
};

export default SidebarLeft;

