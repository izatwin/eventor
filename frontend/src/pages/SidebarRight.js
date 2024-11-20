import React, { useState, useRef, useEffect } from "react";
import '../styles/SidebarRight.css';
import bellIcon from './icons/bell.png'; 
import axios from 'axios'

const SidebarRight = () => {
  const [isNotiDropdownVisible, setNotiDropdownVisible] = useState(false)
  const dropdownRef = useRef(null);
  const [notis, setNotis] = useState([])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotiDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const getNotis = async () => {
      try {
        //const response = await axios.get("");
        //setNotis(response.data);
        setNotis(["1", "2"])
      } catch (err) {
        console.log(err);
      }
    };

    getNotis();

    const interval = setInterval(() => {
      getNotis();
    }, 30000); 

    return () => {
      clearInterval(interval);
    }
  }, []);

  return (
    <div className="sidebar-right">
      <div className="bell-icon">
        <img 
          src={bellIcon} 
          alt="Bell" 
          className="icon-right" 
          onClick={()=>setNotiDropdownVisible(true)}  
        />
        <span 
          className={`dot ${notis.length > 0 ? 'active' : ''}`}>
        </span>
      </div>

      {isNotiDropdownVisible && (
        <div className="noti-dropdown" ref={dropdownRef}> 
          {notis.length === 0 ? (
            <div> 
              <b>All caught up!</b>
            </div>
          ) : (
            notis.map((noti, index) => (
              <div className="noti" key={index}>
                {noti} 
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default SidebarRight;

