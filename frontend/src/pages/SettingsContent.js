import "../styles/SettingsContent.css";
import profilePic from './icons/profile.png'; 
import {useState} from 'react';

const SettingsContent = () => {

  const [content, setContent] = useState("default");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profilePic); 

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

  return (
    <div className="settings-content-container">
        <div className="settings-title">Settings</div>
          {content === "default" && (

            <div className="settings-content">
              <img src={profilePic} alt="Profile" className="settings-pic" />
                <div className="profile-info">
                <div className="profile-name">Suga Sean</div>
                <div className="profile-username">@sugasean2</div>
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
              <input type="text" placeholder="New display name" />
              <button onClick={() => setContent("default")}>Save</button>
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

                <button onClick={() => setContent("default")}>Save</button>
            </div>
            </div>
          )}

         {content === "username-settings" && (
          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change username</div>
              <input type="text" placeholder="New username" />
              <button onClick={() => setContent("default")}>Save</button>
            </div>
            </div>
          )}
         {content === "password-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Change password</div>
              <input type="text" placeholder="New password" />
              <button onClick={() => setContent("default")}>Save</button>
            </div>
           </div>
          )}
         {content === "delete-settings" && (

          <div className="settings-form-content">
            <div className="settings-form">
              <div className="settings-instruct">Delete account</div>
              <input type="text" placeholder="Confirm password" />
              <button onClick={() => setContent("default")}>Confirm</button>
            </div>
           </div>
          )}
    </div>
  );
};

export default SettingsContent;


