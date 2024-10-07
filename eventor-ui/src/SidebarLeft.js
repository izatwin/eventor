import React from "react";
import './SidebarLeft.css';
import homeIcon from './icons/home.png'; // Path to your home icon
import exploreIcon from './icons/explore.png'; // Path to your explore icon
import userIcon from './icons/user.png'; // Path to your user icon
import profilePic from './icons/profile.png'; // Path to the profile picture

const SidebarLeft = ({ onProfileClick }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-title"> EVENTOR </div>
      
      <div className="sidebar-item">
        <img src={homeIcon} alt="Home" className="icon" />
        <span className="dot"></span> {/* Show dot next to active icon */}
      </div>
      <div className="sidebar-item">
        <img src={exploreIcon} alt="Explore" className="icon" />
      </div>
      <div className="sidebar-item">
        <img src={userIcon} alt="User" className="icon" />
      </div>

      {/* Profile Section at the Bottom */}
      <div className="profile" onClick={onProfileClick}>
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <div className="profile-name">Suga Sean</div>
          <div className="profile-username">@sugasean2</div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;

