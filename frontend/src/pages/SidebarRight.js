import React from "react";
import '../styles/SidebarRight.css';
import bellIcon from './icons/bell.png'; 

const SidebarRight = () => {
  return (
    <div className="sidebar-right">
      <div className="bell-icon">
        <img src={bellIcon} alt="Bell" className="icon-right" />
      </div>

    </div>
  );
};

export default SidebarRight;

