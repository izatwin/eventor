import "../styles/SettingsContent.css";
import profilePic from './icons/profile.png'; 
import axios from 'axios'
import { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";

import { useAuth } from '../AuthContext'; 


const SettingsContent = () => {

  const [content, setContent] = useState("default");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profilePic); 
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newDisplay, setNewDisplay] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate();

  const { user, setUser } = useAuth();  

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
  }, [])



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      console.log(file);
    }
  };
  
  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };
  
  const handleDisplayName = async () => {
    try {
      const params =
        {newDisplay : newDisplay,
        };
      console.log(params);
      const response = await axios.post(`http://localhost:3001/api/user/displayname`, params);  
      console.log(response);
      if (response.status === 200) {   
        setUser(prevUser => ({
          ...prevUser, 
          displayName: newDisplay 
        }));
        setContent("default")
      }
      else {
        setNewDisplay(""); 
      }
    } catch (err) {
      console.log("Error:", err);
      setNewDisplay(""); 
    }
  };

  const handleNewDisplayChange = (e) => {
    setNewDisplay(e.target.value);
  }

  const handlePic = () => {
    
    setContent("default")
  };

  const handleUsername = async () => {
    try {
      const params =
        {newUsername : newUsername,
        };
      console.log(params);
      const response = await axios.post(`http://localhost:3001/api/user/username`, params);  
      console.log(response);
      if (response.status === 200) {   
        setUser(prevUser => ({
          ...prevUser, 
          userName: newUsername 
        }));
        setContent("default")
      }
      else {
        setNewUsername(""); 
      }
    } catch (err) {
      console.log("Error:", err);
      setNewUsername(""); 
    }
  };

  const handleNewUsernameChange = (e) => {
    setNewUsername(e.target.value);
  }

  const handlePassword = async () => {
    try {
      const params =
        {oldPassword : oldPassword,
         newPassword : newPassword
        };
      console.log(params);
      const response = await axios.post(`http://localhost:3001/api/user/authorized-reset`, params); 
 
      
      console.log(response);
      if (response.status === 200) {   
        setContent("default")
      }
      else {
        setNewPassword(""); 
      }
    } catch (err) {
      console.log("Error:", err);
      setOldPassword("");
      setNewPassword(""); 
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  }

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  }


  const handleDelete= async () => {
    try {
      const params = {
        password : password
      };
      console.log(params);
      const response = await axios.delete(`http://localhost:3001/api/user/account`, {data: params});  

      console.log(response);
      if (response.status === 200) {   
        navigate("/")
      }
      else {
        setPassword(""); 
      }
    } catch (err) {
      console.log("Error:", err);
      setPassword(""); 
    }
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }

  return (
    <div className="settings-content-container">
        <div className="settings-title">Settings</div>
          {content === "default" && (

            <div className="settings-content">
              <img src={profilePic} alt="Profile" className="settings-pic" />
                <div className="profile-info">
                <div className="profile-displayname">{user.displayName}</div>
                <div className="profile-username">@{user.userName}</div>
              </div>
              <div className="settings-options">
                <button onClick={()=>setContent("name-settings")} className="settings-btn"> Display Name </button>          
                <button onClick={()=>setContent("pic-settings")} className="settings-btn"> Profile Picture</button>          
                <button onClick={()=>setContent("username-settings")} className="settings-btn"> Username </button>          
                <button onClick={()=>setContent("password-settings")} className="settings-btn"> Password </button>          
                <button onClick={()=>setContent("delete-settings")} className="settings-btn"> Delete Account</button>          
            </div>
            </div>

          )}
         {content === "name-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change display name</div>
              <input value={newDisplay} onChange={handleNewDisplayChange}type="text" placeholder="New display name" />
              <button onClick={handleDisplayName}>Save</button>
            </div>
            </div>
          )}
          
        {content === "pic-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change profile picture</div>
                <img src={previewUrl} className="picPreview" alt="Profile" />

                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />

                <button className="upload-button" onClick={handleUploadClick}>
                  Upload new image
                </button>

                <button onClick={handlePic}>Save</button>
            </div>
            </div>
          )}

         {content === "username-settings" && (
          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change username</div>
              <input value={newUsername} onChange={handleNewUsernameChange}type="text" placeholder="New username" />
              <button onClick={handleUsername}>Save</button>
            </div>
            </div>
          )}
         {content === "password-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change password</div>
              <input value={oldPassword} onChange={handleOldPasswordChange}type="password" placeholder="Old password" />
              <input value={newPassword} onChange={handleNewPasswordChange}type="password" placeholder="New password" />
              <button onClick={handlePassword}>Save</button>
            </div>
           </div>
          )}
         {content === "delete-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Delete account</div>
              <input value={password} onChange={handlePasswordChange} type="password" placeholder="Confirm password" />
              <button onClick={handleDelete}>Confirm</button>
            </div>
           </div>
          )}
    </div>
  );
};

export default SettingsContent;


