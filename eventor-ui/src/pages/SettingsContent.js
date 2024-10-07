import "../styles/SettingsContent.css";
import profilePic from './icons/profile.png'; 
import {useState} from 'react';

const SettingsContent = () => {

  const [content, setContent] = useState("default");

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
              <button onClick={()=>setContent("name-settings")} className="settings-btn"> Display Name </button>          
              <button onClick={()=>setContent("pic-settings")} className="settings-btn"> Profile Picture</button>          
              <button onClick={()=>setContent("username-settings")} className="settings-btn"> Username </button>          
              <button onClick={()=>setContent("password-settings")} className="settings-btn"> Password </button>          
              <button onClick={()=>setContent("delete-settings")} className="settings-btn"> Delete Account</button>          
        
            </div>

          )}
         {content === "name-settings" && (

            <div className="settings-content">
              <div className="settings-instruct">Change display name</div>
              <input type="text" placeholder="New display name" />
              <button onClick={() => setContent("default")}>Save</button>
            </div>
          )}
         {content === "username-settings" && (

            <div className="settings-content">
              <div className="settings-instruct">Change username</div>
              <input type="text" placeholder="New username" />
              <button onClick={() => setContent("default")}>Save</button>
            </div>
          )}
         {content === "password-settings" && (

            <div className="settings-content">
              <div className="settings-instruct">Change password</div>
              <input type="text" placeholder="New password" />
              <button onClick={() => setContent("default")}>Save</button>
            </div>
          )}
    </div>
  );
};

export default SettingsContent;


