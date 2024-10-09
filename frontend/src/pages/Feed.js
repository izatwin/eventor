import "../styles/Feed.css";
import { useState, useEffect } from 'react';
import axios from 'axios'

const Feed = () => {
  
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        /* .get() */
        const res = await axios.get("")
        setPosts(res.data[0]);

      } catch (err) {
        console.log(err)
      }
    }
    fetchAllPosts()
  }, [])

  return (
    <div className="feed-container">

      <div className="main-feed">
        <div className="feed-title">My Feed</div>
          <div className="feed-content">
            {posts.map(post=>(
              <div className="post" key = {post.id}>
                /* Post attributes */
              </div>
            ))}
          </div>
      </div>

    </div>
  );
};

export default Feed;


