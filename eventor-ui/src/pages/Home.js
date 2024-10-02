import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import Feed from "./Feed";
import "../styles/Home.css";

const Home = () => {

  return (
    <div className="home-container">
      <SidebarLeft />
      <Feed />
      <SidebarRight />
    </div>
  );
};

export default Home;
