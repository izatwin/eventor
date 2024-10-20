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
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [isAddEventPopupOpen, setAddEventPopupOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const [post, setPost] = useState({
    content : "", 
    is_event : "false",
    commentsEnabled: "false",
    userId: user.userId,
  })

  const [bio, setBio] = useState("")
  
  const [status, setStatus] = useState("")
  
  useEffect(() => {
    
    const validateAndGetPosts = async () => {
      try {
        const validateResponse = await axios.get("http://localhost:3001/api/user/validate") 
          console.log("validate response: ")
          console.log(validateResponse);

          if (validateResponse.status === 200) {
            if (!validateResponse.data['logged-in']) {
              navigate("/")
            }
            const userInfo = validateResponse.data["user-info"];
            setUser({    
              email: userInfo.email,
              displayName: userInfo.displayName,
              userName: userInfo.userName,
              userId : userInfo.userId, 
              bio: userInfo.biography,
              status: userInfo.status,
              pfp: userInfo.imageURL,
            })
            setPost(prevPost => ({
              ...prevPost,
              userId: userInfo.userId,
            }));
            /* postResponse is a list of post ids */
            const postResponse = (await axios.get(`http://localhost:3001/api/user/${validateResponse.data["user-info"].userId}/posts/`)).data
            console.log(postResponse)
            
            /* make request to get the content of each post using id */ 
            
            /* pass an array of posts to setPosts */
            setPosts(postResponse)
          }
          else {
            navigate("/");
          }
      } catch (err) {
        console.log("err");
        console.log(err)
      }
    }

    validateAndGetPosts();

  }, [])

  useEffect(() => {
    setBio(user.bio || "No status yet!");
    setStatus(user.status || "No bio yet!");
  }, [user.bio, user.status]);

  
  const changeBio = (e) => {
    setBio(e.target.value);
  }

  const handleBioEdit = () => {
    console.log("Handle change triggered");
    setEditingBio(true); 
  };

  const handleBioChange = () => {
    const bioChange = async () => {
    try {
      const params = {
        biography: bio,
      }
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/biography`, params);  
      console.log("change bio response: ")
      console.log(response);
      if (response.status === 200) {    
        setUser(prevUser  => ({
          ...prevUser, 
          bio: bio,  
        }));
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
  
  const changeStatus = (e) => {
    setStatus(e.target.value);
  }

  const handleStatusEdit = () => {
    console.log("Handle change triggered");
    setEditingStatus(true); 
  };


  const handleStatusChange = () => {
 
    const statusChange = async () => {
    try {
      const params = {
        status: status,
      }
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/status`, params);  
      console.log("status response: ")
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
  
  const handlePostChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
    console.log(post);
  };

  const handlePost = () => {
    console.log(post)
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
  

  /* Function to handle a user requesting to edit their post */
  const handleEditPopup = (post) => {
    setCurrentPost(post);  
    setEditPopupOpen(true); 
  }
  
  const closeEditPopup = () => {
    setEditPopupOpen(false);
    setCurrentPost(null);    
  };

  /* 
   * This function is called when the value of the textarea 
   * involved in editing a post is changed 
   */
  const handlePostEditChange = (e) => {
    setCurrentPost(prevPost => ({
      ...prevPost,        
      content: e.target.value 
    }));
  }

  /* Function to edit a user's post */
  const handlePostEdit = () => {
    /*const { id, content } = currentPost; */

  }

  /* Function to delete a user's post */
  const handlePostDelete = (id) => {
    // api request 
  }


  const handleAddEventPopup = (post) => {
    setCurrentPost(post);  
    setAddEventPopupOpen(true); 
  }

  const closeAddEventPopup = () => {
    console.log("")
    setAddEventPopupOpen(false);
    setCurrentPost(null);    
  };

  const handleAddEvent = () => {
    
  }
  
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
            <img src={user.pfp || profilePic} alt="Profile" className="profile-picture" />

            <div className="profile-information">
              <div className="p-name">{user.displayName}</div>
              <div className="p-username">@{user.userName}</div>
            </div>


            <div className="profile-side"> 

              <p className="follower-count"> 0 followers </p>
      
            </div>
         </div> 
          
          <div className="status-container">
          
            <textarea name="status" readOnly={!editingStatus} className="profile-status" type="text" onChange={changeStatus} value={status} />
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
            <textarea name="content" className="post-text" value={post.content} type="text" onChange={handlePostChange} placeholder="What will you be hosting next?"/>
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

                <img src={user.pfp || profilePic} alt="PostProfile" className="post-profilepic" />
                
                <div className="post-profile-info">
                  <div className="post-name">{user.displayName}</div>
                  <div className="post-username">@{user.userName}</div>
                </div>      

                 <div className="modify-post">
                  <button onClick={() => handleAddEventPopup(post)} className="add-event-btn"> Add Event </button> 
                  <img src={editIcon} onClick={() => handleEditPopup(post)} alt="Edit" className="edit-post-icon " />
                  <img src={removeIcon} onClick={() => handlePostDelete(post.id)} alt="Remove" className="remove-icon " />
            
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
              </div>
            </div>

          ))}
        </div>
        
      {isEditPopupOpen && (
        <div className="edit-popup">
          <div className="edit-popup-content">
            <h2>Edit post</h2>
            <textarea 
              value={currentPost?.content || ''} 
              className="edit-post-textarea"
              onChange={handlePostEditChange}  
              placeholder="Edit your post"
              rows="5"
              cols="30"
            />
            <button onClick={handlePostEdit} className="save-button">Save</button>
            <button onClick={closeEditPopup} className="close-button">x</button>
          </div>
        </div>
      )}
    
          {isAddEventPopupOpen && (
            <div className="add-event-popup">
              <div className="add-event-content">
                <h2>Create event</h2>
                <form>
                  <input type="text" placeholder="Name" name="name" className="input-field" />
                  <textarea placeholder="Description" name="description" className="input-field textarea-field" />
                  <input type="text" placeholder="Type" name="type" className="input-field" />
                  <input type="text" placeholder="Image" name="image" className="input-field" />
                  <div className="date-fields">
                    <input type="date" name="start" className="input-field" />
                    <span className="date-separator">-</span>
                    <input type="date" name="end" className="input-field" />
                  </div>
                </form>
                <button onClick={handleAddEvent} className="add-event-button">Add</button>
                <button onClick={closeAddEventPopup} className="close-button">x</button>
              </div>
            </div>
        )}


        <div className="postPopups">
          <div class="popup" id="success">Post created successfully!</div>
          <div class="popup" id="fail">Error creating post!</div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileContent;


