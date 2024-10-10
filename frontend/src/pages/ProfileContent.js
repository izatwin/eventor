import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import imageIcon from './icons/image.png'
import calendarIcon from './icons/calendar.png'
import axios from 'axios'
import React, { useState } from "react";

const ProfileContent= () => {


  const [post, setPost] = useState({
    content : "", 
    event : "false",
    commentsEnabled: "false",
  })
  
  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
    console.log(post);
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

          <img src={profilePic} alt="Profile" className="profile-picture" />

          <div className="profile-information">
            <div className="p-name">Suga Sean</div>
            <div className="p-username">@sugasean2</div>
          </div>

          <div className="profile-status">"Everyday is a new beginning..."</div>
          <div className="profile-side"> 

            <p className="follower-count"> ### followers </p>
            <div className="edit-card"> 
              <img src={editIcon} alt="Edit" className="edit-icon"/> 
              <p className="edit-text"> Edit Status </p>
            </div>
          </div>


        </div>


        <div className="profile-lower-card">
          <div className="about-section">
            <h className="about-title"> About </h>
            <p className="about-text"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tincidunt molestie ultricies. Aliquam erat volutpat. Proin dictum nibh at lectus faucibus vehicula</p>
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
        
        <div className="postPopups">
          <div class="popup" id="success">Post created successfully!</div>
          <div class="popup" id="fail">Error creating post!</div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileContent;


