import React, { useState } from "react";
import bellIcon from '../pages/icons/bell.png'; 


const DropdownButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("No Notifications")

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setNotificationType(option)
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img src={bellIcon} alt="Bell" className="icon-small" />
      <button className="notification-btn" onClick={toggleDropdown}>
        {notificationType}</button>
      {isOpen && (
        <div className="notification-dropdown">
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("No Notifications")}
          >
            No Notifications
          </div>
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("Events Only")}
          >
            Events Only
          </div>
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("All Posts")}
          >
            All Posts
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
