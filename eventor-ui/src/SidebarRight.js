import React from "react";
import './SidebarRight.css';
import bellIcon from './icons/bell.png'; // Path to your home icon

const SidebarRight = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <img src={bellIcon} alt="Bell" className="icon" />
      </div>

    </div>
  );
};

export default SidebarRight;

