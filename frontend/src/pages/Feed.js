import "../styles/Feed.css";
import { useState, useEffect } from 'react';
import axios from 'axios'

import profilePic from './icons/profile.png'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import shareIcon from './icons/share.png'

const Feed = () => { 
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    console.log("hiii");
    console.log("hiii");

    axios.get("http://localhost:3001/api/posts")
    .then(response => {
      console.log(response.data)
      setPosts(response.data)
    })
    .catch (err => {
      console.log(err)
    })
    axios.get("http://localhost:3001/api/user/validate") 
    .then(response => {
      console.log(response);
    })
    .catch (err =>  {
      console.log("err");
      console.log(err)
    })  



  }, [])

  return (
    <div className="feed-container">

      <div className="feed-title">My Feed</div>
      <div className="feed-content">
        {posts.map(post=>(

          <div className="post" key={post.id}>

            <div className="post-header"> 

              <img src={profilePic} alt="PostProfile" className="post-profilepic" />
              
              <div className="post-profile-info">
                <div className="post-name">displayName</div>
                <div className="post-username">@username</div>
              </div>      

            </div>

            <div className="post-content"> 
              {post.content}
            </div>

            <div className="post-buttons">

              <img src={viewIcon} alt="View" className="view-icon post-icon"/> 
              <div className="views-num num">{post.views}</div>
              <img src={likeIcon} alt="Like" className="like-icon post-icon"/> 
              <div className="likes-num num"> {post.likes} </div>
              <img src={shareIcon} alt="Share" className="share-icon post-icon"/> 
              <div className="shares-num num"> {post.shares} </div>
            </div>
          </div>

        ))}
      </div>

    </div>
  );
};

export default Feed;


