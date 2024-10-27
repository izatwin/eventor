import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import DiscoverContent from "./DiscoverContent";
import "../styles/Discover.css";

const Discover = () => {

  return (
    <div className="discover-container">
     
      <SidebarLeft />
      <DiscoverContent />
      <SidebarRight />

    </div>
  );
};

export default Discover;
