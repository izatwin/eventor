import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import SettingsContent from "./SettingsContent";
import "../styles/Settings.css";

const Settings = () => {

  return (
    <div className="settings-container">
     
      <SidebarLeft />
      <SettingsContent />
      <SidebarRight />

    </div>
  );
};

export default Settings;
