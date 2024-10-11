import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import imageIcon from './icons/image.png'
import calendarIcon from './icons/calendar.png'
import checkIcon from './icons/check.png'

import axios from 'axios'
import React, { useState } from "react";

import { useAuth } from '../AuthContext'; 

const ProfileContent= () => {

  const { user, setUser } = useAuth();  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  const [post, setPost] = useState({
    content : "", 
    event : "false",
    commentsEnabled: "false",
  })

  const [bio, setBio] = useState({
    bio: ""
  })
  
  const [status, setStatus] = useState({
    status: ""
  })
  
  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
    console.log(post);
  };
  
  
  const handleBioEdit = () => {
    console.log("Handle change triggered");
    setEditingBio(true); 
  };


  const handleBioChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser, 
      bio: e.target.value,  
    }));
    console.log("false");
    setEditingBio(false); 
  };
  
  const handleStatusEdit = () => {
    console.log("Handle change triggered");
    setEditingStatus(true); 
  };

  const handleStatusChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser, 
      status: e.target.value,  
    }));
    
    setEditingStatus(false); 

  };
  

  const handlePost = () => {
    axios.post("http://localhost:3001/api/posts", post)
      .then(response => {
        console.log(response.data)
        showSuccessPopup(); 
        setPost({ ...post, content: "" });
      })
      .catch (err => {
        console.log(err)
        showFailPopup(); 
        setPost({ ...post, content: "" })
      });
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };
  
  const showSuccessPopup = () => {
    var popup = document.getElementById("success");
    popup.classList.add("show");

    setTimeout(function() {
        popup.classList.remove("show");
    }, 1000);
}

  const showFailPopup = () => {
    var popup = document.getElementById("fail");
    popup.classList.add("show");

    setTimeout(function() {
        popup.classList.remove("show"); 
    }, 1000);
  }

  return (
    <div className="profile-content-container">
      <div className="profile-title">Profile</div>
      <div className="profile-content">
        <div className="upper-profile-card">
          
          <div className="profile-upper-container">
            <img src={profilePic} alt="Profile" className="profile-picture" />

            <div className="profile-information">
              <div className="p-name">{user.displayName}</div>
              <div className="p-username">@{user.userName}</div>
            </div>


            <div className="profile-side"> 

              <p className="follower-count"> ### followers </p>
      
            </div>
         </div> 
          
          <div className="status-container">
          
            <textarea name="status" readOnly={!editingStatus} className="profile-status" type="text" onChange={handleStatusEdit} value={user.status}/>
            <div className="edit-card"> 
              <img src={editingStatus ? checkIcon : editIcon } onClick={editingStatus ? handleStatusChange : handleStatusEdit } alt="Edit" className="edit-icon"/> 
              <p className="edit-text"> Edit Status </p>
            </div>

          </div>

        </div>


        <div className="profile-lower-card">

          <div className="about-title-container">
            <h className="about-title"> About </h>
            <div className="edit-bio-card"> 
              <img src={editingBio ? checkIcon : editIcon} onClick={editingBio ? handleBioChange : handleBioEdit} alt="Edit" className="edit-bio-icon"/> 
              <p className="edit-bio-text"> Edit Bio </p>
            </div>
          </div>
          
          <div className="about-text-container">

            <textarea name="bio" readOnly={!editingBio} className="profile-bio" type="text" onChange={handleBioEdit} value={user.bio}/>
          </div>

        </div>
      

        <div className="post-card">
          
          <div className="post-input">
            <textarea name="content" className="post-text" value={post.content} type="text" onChange={handleChange} placeholder="What will you be hosting next?"/>
          </div>

          <div className="post-buttons">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <img src={imageIcon} onClick={handleUploadClick} lt="Image" className="image-icon"/> 
            <img src={calendarIcon} alt="Calendar" className="calendar-icon"/> 
            <button onClick={handlePost} className="post-btn"> Post </button> 
          </div>
            
        </div>
        

        <div className="profile-feed">
          
        </div>
        
        
        <div className="postPopups">
          <div class="popup" id="success">Post created successfully!</div>
          <div class="popup" id="fail">Error creating post!</div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileContent;


