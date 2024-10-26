import "../styles/PostContent.css";
import { useState, useEffect } from 'react';

import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'

import profilePic from './icons/profile.png'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import shareIcon from './icons/share.png'

import { useAuth } from '../AuthContext'; 
import { usePopup } from '../PopupContext';

const PostContent = () => { 
  const [post, setPost] = useState([]);
  const { setUser } = useAuth();  
  const navigate = useNavigate();
  const { _id } = useParams(); 
  const { showSharePopup, updateShareCount } = usePopup();

  
  useEffect(() => {
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
    console.log(`id: ${_id}`)
    axios.get(`http://localhost:3001/api/posts/${_id}`)
    .then(response => {
      console.log("feed posts res:")
      console.log(response.data)
      setPost(response.data)
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
    <div className="post-content-container">
      <div className="post-content-content">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostContent;


