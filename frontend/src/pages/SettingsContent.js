import "../styles/SettingsContent.css";
import profilePic from './icons/profile.png'; 
import axios from 'axios'
import { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";

import { useAuth } from '../AuthContext'; 
import { usePopup } from '../PopupContext';



const SettingsContent = () => {

  const [content, setContent] = useState("default");
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(profilePic); 
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newDisplay, setNewDisplay] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate();

  const { user, setUser } = useAuth();  
  const { showOffensivePopup, showFailPopup } = usePopup();

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_URL + "/api/user/validate") 
    .then(response => {
      console.log(response);
      if (response.status === 200) {
        console.log("here"); 
        const userInfo = response.data['user-info'];
        console.log(userInfo);
        setUser({    
          email: userInfo.email,
          displayName: userInfo.displayName,
          userName: userInfo.userName,
          userId : userInfo.userId,
          pfp: userInfo.imageURL
        })
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

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);  
  };
  
  const handleDisplayName = async () => {
    if (!newDisplay) {
      showFailPopup("Missing display name!")
      return;
    }
    setNewDisplay(""); 
    try {
      const params =
        {newDisplay : newDisplay,
        };
      console.log(params);
      const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/displayname`, params);  
      console.log(response);
      if (response.status === 200) {   
        setUser(prevUser => ({
          ...prevUser, 
          displayName: newDisplay 
        }));
        setContent("default")
      }
      else {
      }
    } catch (err) {
      if (err.response.status === 422) {
        showOffensivePopup('The display name you entered is offensive or obscene')
      }
      else {
        showFailPopup(err.response.data.message)
      }
      console.log("Error:", err);
    }
  };

  const handleNewDisplayChange = (e) => {
    setNewDisplay(e.target.value);
  }

  const handleProfilePic = async () => {    
    if (!imageUrl) {
      showFailPopup("Missing URL!")
      return;
    }
    setImageUrl(""); 
      try {
        const params =
          {imageURL : imageUrl};
        console.log(params);
        const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/${user.userId}/image`, params);  
        console.log('pic response:')
        console.log(response);
        if (response.status === 200) {   
          setUser(prevUser => ({
            ...prevUser, 
            pfp: imageUrl 
          }));
          setContent("default")
        }
        else {
        }
      } catch (err) {
        showFailPopup(err.response.data.message)
        console.log("Error:", err);
      }
  };

  const handleUsername = async () => {
    if (!newUsername) {
      showFailPopup("Missing username!")
      return;  
    }
    try {

      setNewUsername(""); 
      const params =
        {newUsername : newUsername,
        };
      console.log(params);
      const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/username`, params);  
      console.log(response);
      if (response.status === 200) {   
        setUser(prevUser => ({
          ...prevUser, 
          userName: newUsername 
        }));
        setContent("default")
      }
      else {
      }
    } catch (err) {
      if (err.response.status === 422) {
        showOffensivePopup('The username you entered is offensive or obscene')
      }
      else {
        showFailPopup(err.response.data.message)
      }
      console.log("Error:", err);
    }
  };

  const handleNewUsernameChange = (e) => {
    setNewUsername(e.target.value);
  }

  const handlePassword = async () => {
    if (!oldPassword || !newPassword) {
      showFailPopup("Missing password!")
      return;
    }
    setOldPassword("");
    setNewPassword(""); 
    try {

      const params =
        {oldPassword : oldPassword,
         newPassword : newPassword
        };
      console.log(params);
      const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/authorized-reset`, params); 
 
      
      console.log(response);
      if (response.status === 200) {   
        setContent("default")
      }
      else {
      }
    } catch (err) {
      showFailPopup(err.response.data.message)
      console.log("Error:", err);
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  }

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  }


  const handleDelete= async () => {
    if (!password) {
      showFailPopup("Missing password!")
      return;
    }
    setPassword(""); 
    try {
      const params = {
        password : password
      };
      console.log(params);
      const response = await axios.delete(process.env.REACT_APP_API_URL + `/api/user/account`, {data: params});  

      console.log(response);
      if (response.status === 200) {   
        navigate("/")
      }
      else {
      }
    } catch (err) {
      showFailPopup(err.response.data.message)
      console.log("Error:", err);
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
              <img src={user.pfp || profilePic} alt="Profile" className="settings-pic" />
                <div className="profile-info">
                <div className="profile-displayname">{user.displayName}</div>
                <div className="profile-username">@{user.userName}</div>
              </div>
              <div className="settings-options">
                <button onClick={()=>setContent("name-settings")} className="settings-btn name-btn"> Display Name </button>          
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
              <button className='settings-save-btn' onClick={handleDisplayName}>Save</button>
              <button className="settings-back" onClick={() => setContent('default')}> Back </button>
            </div>
            </div>
          )}
          
        {content === "pic-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change profile picture</div>
                {previewUrl && <img src={user.pfp || previewUrl} className="picPreview" alt="Profile" />}


                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={handleUrlChange}
                />

                <button className='settings-save-btn' onClick={handleProfilePic}>Save</button>
                <button className="settings-back" onClick={() => setContent('default')}> Back </button>
            </div>
          </div>
          )}

         {content === "username-settings" && (
          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change username</div>
              <input value={newUsername} onChange={handleNewUsernameChange}type="text" placeholder="New username" />
              <button className='settings-save-btn' onClick={handleUsername}>Save</button>
              <button className="settings-back" onClick={() => setContent('default')}> Back </button>
            </div>
          </div>
          )}
         {content === "password-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change password</div>
              <input value={oldPassword} onChange={handleOldPasswordChange}type="password" placeholder="Old password" />
              <input value={newPassword} onChange={handleNewPasswordChange}type="password" placeholder="New password" />
              <button className='settings-save-btn' onClick={handlePassword}>Save</button>
              <button className="settings-back" onClick={() => setContent('default')}> Back </button>
            </div>
           </div>
          )}
         {content === "delete-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Delete account</div>
              <input value={password} onChange={handlePasswordChange} type="password" placeholder="Confirm password" />
              <button className='settings-save-btn' onClick={handleDelete}>Submit</button>
              <button className="settings-back" onClick={() => setContent('default')}> Back </button>
            </div>
           </div>
          )}
    </div>
  );
};

export default SettingsContent;


