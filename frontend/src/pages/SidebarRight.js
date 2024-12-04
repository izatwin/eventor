import React, { useState, useRef, useEffect } from "react";
import '../styles/SidebarRight.css';
import bellIcon from './icons/bell.png'; 
import axios from 'axios'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import profilePic from './icons/profile.png';

const SidebarRight = () => {
  const [isNotiDropdownVisible, setNotiDropdownVisible] = useState(false)
  const dropdownRef = useRef(null);
  const [notis, setNotis] = useState([])
  const [postMap, setPostMap] = useState({});
  const [userMap, setUserMap] = useState({});

  dayjs.extend(relativeTime);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        readAllNotis()
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
        //await axios.post(process.env.REACT_APP_API_URL + `/api/user/notifications/opt-in`, {userId: "8fd17048-52a1-4891-987c-472f0e935b8b", optInStatus: "Posts"});
        const notiResponse = await axios.get(process.env.REACT_APP_API_URL + `/api/user/notifications`);
        console.log(notiResponse)
        const unreadNotis = notiResponse.data.filter((noti) => noti.read === false);
        setNotis(unreadNotis);

        const postRequests = notiResponse.data.map((noti) =>
          axios.get(process.env.REACT_APP_API_URL + `/api/posts/${noti.postId}`)
        );
        const postResponses = await Promise.all(postRequests);
        const userRequests = postResponses.map((response) =>
          axios.get(process.env.REACT_APP_API_URL + `/api/user/${response.data.user}`)
        );
        const userResponses = await Promise.all(userRequests);

        const newPostMap = { ...postMap };
        const newUserMap = { ...userMap };

        notiResponse.data.forEach((noti, index) => {
          newPostMap[noti.postId] = postResponses[index].data;
          newUserMap[postResponses[index].data.user] = userResponses[index].data;
        });

        setPostMap(newPostMap);
        setUserMap(newUserMap);

      } catch (err) {
        console.log(err);
      }
    };

    getNotis();

    const interval = setInterval(() => {
      getNotis();
    }, 15000); 

    return () => {
      clearInterval(interval);
    };
  }, [])
  
  const readAllNotis = async () => {
    try {
      await axios.patch(process.env.REACT_APP_API_URL + `/api/user/notifications/mark-read`);
      setNotis([])
    } catch (err) {
      console.log(err);
    }
  }

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
      notis.map((noti, index) => {
        const post = postMap[noti.postId]; 
        const user = userMap[post?.user]; 

        return post && user && (
          <div className="noti" key={index}>
            <div className="timestamp"> 
                {dayjs(noti.timestamp).fromNow()}
            </div>
            <div className="post-header">
              <img src={user.imageURL ? user.imageURL : profilePic} alt="PostProfile" className="post-profilepic" />
              <div className="post-profile-info">
                  <div className="post-name">{user.displayName}</div>
                  <div className="post-username">@{user.userName}</div>
              </div>
            </div>
            <div className="noti-content">
              Posted: 
              "{post.content ? post.content.length > 25
                ? `${post.content.slice(0, 25)}...` : post.content
                : "New event"}"
            </div>
          </div>
        ) 
      })
    )}
  </div>
)}



    </div>
  );
};

export default SidebarRight;

