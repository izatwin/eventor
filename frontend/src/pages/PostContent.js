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
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { _id } = useParams();
  const { showSharePopup, updateShareCount, updateLike } = usePopup();
  const [newComment, setNewComment] = useState({
    text: "",
    isRoot: true,
  })
  const [comments, setComments] = useState([])


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
            userId: userInfo.userId,
            pfp: userInfo.imageURL,
            likedPosts: userInfo.likedPosts
          })
        }
        else {
          navigate("/");
        }
      })
      .catch(err => {

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
      .catch(err => {
        console.log(err)
      })

    axios.get(`http://localhost:3001/api/comments/post/${_id}`)
      .then(response => {
        console.log(`Comments are: ${response.data}`)
        setComments(response.data)
      })
      .catch(err => {
        console.log(err)
      })

  }, [])

  const handleShare = async (id) => {
    const success = await updateShareCount(id);
    if (success) {
      setPost((prevPost) => ({
        ...prevPost,
        shares: prevPost.shares + 1
      }));

    } else {
      console.error('Error updating share count');
    }
  };

  const handleLike = async (id) => {
    var success = false
    var likedPosts = user.likedPosts || [];
    if (likedPosts.includes(id)) {
      // post is already liked, we want to unlike
      success = await updateLike(id, false);
      if (success) {
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes - 1
        }));
        likedPosts = likedPosts.filter(curId => curId !== id)
        
      }

    } else {
      // post is not liked, want to like
      success = await updateLike(id, true);
      if (success) {
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes + 1
        }));
        likedPosts.push(id)
      }
    }
    setUser(prevUser => ({
      ...prevUser,
      likedPosts: likedPosts
    }))

    if (!success) {
      console.error('Error updating like status');
    }
  };

  const handleCommentChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  }

  const handleComment = async () => {
    const tempNewComment = (await axios.post(`http://localhost:3001/api/comments`, {"comment": newComment, "postId": post._id})).data
    setComments((prevComments) => [tempNewComment, ...prevComments]);
  }

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

            <img src={viewIcon} alt="View" className="view-icon post-icon" />
            <div className="views-num num">{post.views}</div>
            <img onClick={() => { handleLike(post._id) }} src={likeIcon} alt="Like" className="like-icon post-icon" />
            <div className="likes-num num"> {post.likes} </div>
            <img onClick={() => { showSharePopup(post._id); handleShare(post._id) }} src={shareIcon} alt="Share" className="share-icon post-icon" />
            <div className="shares-num num"> {post.shares} </div>
          </div>
        </div>

        <div className="comment-card">
          
          <div className="comment-input">
            <textarea 
              name="text" 
              className="comment-text" 
              value={newComment.text} 
              type="text" 
              onChange={handleCommentChange} 
              placeholder="What do you think?"/>
          </div>

          <div className="comment-buttons">
            <button 
              onClick={handleComment} 
              className="comment-btn"> 
              Comment 
            </button> 
          </div>
          

            
        </div>
        <div className="comment-section">

        {comments.map(comment=>(
          <div className="comment"> 
            <div className="comment-content">
              {comment.text}
            </div>
          </div>
        ))}

        </div>
      </div>
    </div>
  );
};

export default PostContent;


