import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import imageIcon from './icons/image.png'
import calendarIcon from './icons/calendar.png'

const ProfileContent= () => {

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
          <input className="post-text" type="text" placeholder="What will you be hosting next?"/> 
        </div>
        <div className="post-buttons">
          <img src={imageIcon} alt="Image" className="image-icon"/> 
          <img src={calendarIcon} alt="Calendar" className="calendar-icon"/> 
          <button className="post-btn"> Post </button> 
        </div>
          
      </div>
        
        
      </div>
    </div>
  );
};

export default ProfileContent;


