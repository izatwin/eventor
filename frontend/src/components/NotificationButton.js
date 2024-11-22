import React, { useState, useEffect } from "react";
import bellIcon from '../pages/icons/bell.png'; 

import axios from 'axios'


const DropdownButton = ({userId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("No Notifications")
  const notiTypeDict = {
    "None": "No Notifications",
    "Events": "Events Only",
    "Posts": "All Posts",
  };
  
  

  useEffect(() => {
    if (!userId) return;

    const fetchNotificationType = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + `/api/user/notifications/opt-in/${userId}`);
        const optInStatus = response.data.optInStatus

        setNotificationType(notiTypeDict[optInStatus])
      } catch (err) {
        console.error(`Error retrieving opt-in status ${err}`)
      }


    };

    fetchNotificationType();
  }, [userId]);


  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setNotificationType(notiTypeDict[option])
    setServerNotificationType(option)
    setIsOpen(false); // Close dropdown after selection
  };

  const setServerNotificationType = (option) => {
    axios.post(process.env.REACT_APP_API_URL + `/api/user/notifications/opt-in`, {userId: userId, optInStatus: option})
    .catch((err) => {
      console.error(`Unable to update notification type, error: ${err}`)
    })
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img src={bellIcon} alt="Bell" className="icon-small" />
      <button className="notification-btn" onClick={toggleDropdown}>
        {notificationType}</button>
      {isOpen && (
        <div className="notification-dropdown">
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("None")}
          >
            No Notifications
          </div>
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("Events")}
          >
            Events Only
          </div>
          <div
            className="notification-dropdown-btn"
            onClick={() => handleOptionClick("Posts")}
          >
            All Posts
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
