import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import imageIcon from './icons/image.png'
import calendarIcon from './icons/calendar.png'
import checkIcon from './icons/check.png'
import removeIcon from './icons/remove.png'

import axios from 'axios'
import { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import shareIcon from './icons/share.png'

const ProfileContent= () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [posts, setPosts] = useState([]);

  const [post, setPost] = useState({
    content : "", 
    is_event : "false",
    commentsEnabled: "false",
    userId: user.userId,
  })

  const [bio, setBio] = useState(user.bio)
  
  const [status, setStatus] = useState({
    status: user.status,
  })
  
  useEffect(() => {
    axios.get("http://localhost:3001/api/user/validate") 
    .then(response => {
      console.log(response);
      if (response.status === 200) {
        console.log("here"); 
        console.log(response.data['user-info']);
        setUser({    
          email: response.data["user-info"].email,
          displayName: response.data["user-info"].displayName,
          userName: response.data["user-info"].userName,
          userId : response.data["user-info"].userId}) 
      }
      else {
        navigate("/");
      }
    })
    .catch (err =>  {
      navigate("/");
      console.log(err)
    })  
    
    console.log("yuhh" + user.userId);
    axios.get(`http://localhost:3001/api/user/${user.userId}/posts/`)
    .then(response => {
      console.log(response.data)
      setPosts(response.data)
    })
    .catch (err => {
      console.log(err)
    })
  }, [])

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
    console.log(post);
  };
  
  
  const changeBio = (e) => {
    setBio(e.target.value);
  }

  const handleBioEdit = () => {
    console.log("Handle change triggered");
    setEditingBio(true); 
  };

  const handleBioChange = (e) => {
    const bioChange = async () => {
    try {
      const params = {
        biography: bio,
      }
      console.log(params); 
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/biography`, params);  
      console.log(response);
      if (response.status === 200) {    
        console.log("updatinggg")
        
        setUser(prevUser  => ({
          ...prevUser, 
          bio: bio,  
        }));


        console.log(user);
      }
      else {
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

    bioChange();
    setEditingBio(false); 
  };
  
  const handleStatusEdit = () => {
    console.log("Handle change triggered");
    setEditingStatus(true); 
  };
  
  const changeStatus = (e) => {
    setStatus(e.target.value);
  }
  const handleStatusChange = (e) => {
    console.log(status); 
 
    const statusChange = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/status`, status);  
      console.log(response);
      if (response.status === 200) {    
        setUser((prevUser) => ({
          ...prevUser, 
        status: status,  
        }));
      }
      else {
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

    statusChange();
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
      <div className="profile-content">
        <div className="upper-profile-card">
          
          <div className="profile-upper-container">
            <img src={profilePic} alt="Profile" className="profile-picture" />

            <div className="profile-information">
              <div className="p-name">{user.displayName}</div>
              <div className="p-username">@{user.userName}</div>
            </div>


            <div className="profile-side"> 

              <p className="follower-count"> 0 followers </p>
      
            </div>
         </div> 
          
          <div className="status-container">
          
            <textarea name="status" readOnly={!editingStatus} className="profile-status" type="text" onChange={changeStatus} value={user.status} />
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

            <textarea name="bio" readOnly={!editingBio} className="profile-bio" type="text" onChange={changeBio} value={bio}/>
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
          {posts.map(post=>(

            <div className="post" key={post.id}>

              <div className="post-header"> 

                <img src={profilePic} alt="PostProfile" className="post-profilepic" />
                
                <div className="post-profile-info">
                  <div className="post-name">{user.displayName}</div>
                  <div className="post-username">@{user.userName}</div>
                </div>      

              </div>

              <div className="post-content"> 
                {post.content}
              </div>

              <div className="post-buttons">

                <img src={viewIcon} alt="View" className="view-icon post-icon"/> 
                <div className="views-num num">{post.views}</div>
                <img src={likeIcon} alt="Like" className="like-icon post-icon"/> 
                <div className="likes-num num"> {post.likes} </div>
                <img src={shareIcon} alt="Share" className="share-icon post-icon"/> 
                <div className="shares-num num"> {post.shares} </div>
                <div className="modify-post">
                  <img src={removeIcon} alt="Remove" className="remove-icon post-icon" />
                  <img src={editIcon} alt="Edit" className="edit-post-icon post-icon" />
                </div>

              </div>
            </div>

          ))}
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


