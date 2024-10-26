import "../styles/Feed.css";
import { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";
import axios from 'axios'

import profilePic from './icons/profile.png'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import shareIcon from './icons/share.png'
import expandIcon from './icons/expand.png'
import commentIcon from './icons/comment.png'

import { useAuth } from '../AuthContext'; 
import { usePopup } from '../PopupContext';

const Feed = () => { 
  const [posts, setPosts] = useState([]);
  const { setUser } = useAuth();  
  const { showSharePopup, updateShareCount } = usePopup();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("hiii");
    console.log("hiii");
    
    axios.get("http://localhost:3001/api/user/validate") 
    .then(response => {
      console.log(response);
      if (response.status === 200) {
        console.log("here"); 
        const userInfo = response.data['user-info'];
        console.log(userInfo);
        setUser({    
          email: userInfo.email,
          displayName: userInfo.displayName,
          userName: userInfo.userName,
          userId : userInfo.userId,
          pfp: userInfo.imageURL
        })
      }
      else {
        navigate("/");
      }
    })
    .catch (err =>  {

      navigate("/");
      console.log(err)
    })  

    axios.get("http://localhost:3001/api/posts")
    .then(response => {
      console.log("feed posts res:")
      console.log(response.data)
      setPosts(response.data)
    })
    .catch (err => {
      console.log(err)
    })
  }, [])
 
  // TODO
  const handleShare = async (id) => {
    const success = await updateShareCount(id);
    if (success) {
      // update share locally?
    } else {
      console.error('Error updating share count');
    }
  };

  return (
    <div className="feed-container">

      <div className="feed-title">My Feed</div>
      <div className="feed-content">
        {posts.map(post=>(

          <div className="post" key={post._id}>

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
              <img onClick={()=>{showSharePopup(post._id); handleShare(post._id)}} src={shareIcon} alt="Share" className="share-icon post-icon"/> 
              <div className="shares-num num"> {post.shares} </div>
              <div className="expand-comment">
                <img src={commentIcon} alt="Comment" className="comment-icon post-icon"/> 
                <div className="comment-num num">{post.comments.length}</div>
                <img 
                  src={expandIcon} 
                  alt="Expand" 
                  className="expand-icon post-icon"
                  onClick={()=>{navigate(`/post/${post._id}`)}}/> 
              </div>
            </div>
          </div>

        ))}
      </div>

    </div>
  );
};

export default Feed;


