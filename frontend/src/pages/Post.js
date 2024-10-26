import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import PostContent from "./PostContent";
import "../styles/Post.css";
import axios from 'axios'

import { useEffect } from 'react';

const Post = () => {


  useEffect(() => {

  }, [])

  return (
    <div className="post-container">
     
      <SidebarLeft />
      <PostContent />
      <SidebarRight />

    </div>
  );
};

export default Post;
