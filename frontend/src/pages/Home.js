import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import Feed from "./Feed";
import "../styles/Home.css";
import axios from 'axios'

import { useEffect } from 'react';

const Home = () => {


  useEffect(() => {

  }, [])

  return (
    <div className="home-container">
     
      <SidebarLeft />
      <Feed />
      <SidebarRight />

    </div>
  );
};

export default Home;
