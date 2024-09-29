import React, { useState, useRef, useEffect } from "react";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import "./Feed.css";

const Feed = () => {
  const [isProfilePopupVisible, setProfilePopupVisible] = useState(false);
  const popupRef = useRef(null);

  const handleProfileClick = () => {
    setProfilePopupVisible(!isProfilePopupVisible);
  };

  // Close the popup when clicking outside of it
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

  return (
    <div className="feed-container">
      {/* Left Sidebar */}
      <SidebarLeft onProfileClick={handleProfileClick} />

      {/* Main Feed Area */}
      <div className="main-feed">
        <div className="feed-title">My Feed</div>
        <div className="feed-content">
          {/* Add feed posts here */}
        </div>
      </div>

      {/* Profile Popup */}
      {isProfilePopupVisible && (
        <div className="profile-popup" ref={popupRef}>
          <div className="popup-item">Settings</div>
          <div className="popup-item">Sign out</div>
        </div>
      )}

      <SidebarRight/>
    </div>
  );
};

export default Feed;


