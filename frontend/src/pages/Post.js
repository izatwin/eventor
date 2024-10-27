import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import PostContent from "./PostContent";
import "../styles/Post.css";

const Post = () => {

  return (
    <div className="post-container">
     
      <SidebarLeft />
      <PostContent />
      <SidebarRight />

    </div>
  );
};

export default Post;
