import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import ProfileContent from "./ProfileContent";
import "../styles/Profile.css";

const Profile = () => {

  return (
    <div className="profile-container">
     
      <SidebarLeft />
      <ProfileContent />
      <SidebarRight />

    </div>
  );
};

export default Profile;
