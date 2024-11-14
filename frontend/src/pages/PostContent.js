import "../styles/PostContent.css";
import { useState, useEffect} from 'react';

import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'

import profilePic from './icons/profile.png';
import likeIcon from './icons/like.png'
import commentIcon from './icons/comment.png'


import Post from '../components/Post';

import { useAuth } from '../AuthContext';

const PostContent = () => {
  const [post, setPost] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { _id } = useParams();
  const [newComment, setNewComment] = useState({
    text: "",
    isRoot: true,
  })
  const [comments, setComments] = useState([])
  const [poster, setPoster] = useState([])
  const [commenters, setCommenters] = useState([])
  const [postEvent, setPostEvent] = useState(null)
  const [loading, setLoading] = useState(true); 
  const [isReplyPopupOpen, setReplyPopupOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [replyComment, setReplyComment] = useState({
    text: "",
    isRoot: false,
  })

useEffect(() => {
  const fetchData = async () => {
    try {
      const userResponse = await axios.get("http://localhost:3001/api/user/validate");
      console.log(userResponse);
      if (userResponse.status === 200) {
        console.log("here");
        const userInfo = userResponse.data['user-info'];
        console.log(userInfo);
        setUser({
          email: userInfo.email,
          displayName: userInfo.displayName,
          userName: userInfo.userName,
          userId: userInfo.userId,
          pfp: userInfo.imageURL,
          likedPosts: userInfo.likedPosts
        });
      } else {
        navigate("/");
      }
    } catch (err) {
      navigate("/");
      console.log(err);
    }

    console.log(`id: ${_id}`);
    try {
      const postResponse = await axios.get(`http://localhost:3001/api/posts/${_id}`);
      console.log("feed posts res:");
      console.log(postResponse.data);
      setPost([postResponse.data]);

      // Get event of post if it exists
      if (postResponse.data["eventId"]) {
        const eventResponse = await axios.get(`http://localhost:3001/api/events/${postResponse.data["eventId"]}`);
        setPostEvent(eventResponse.data)
      }

      // Get the poster information
      try {
        const posterResponse = await axios.get(`http://localhost:3001/api/user/${postResponse.data["user"]}`);
        console.log("poster res:");
        console.log(posterResponse.data);
        const posterResponseInfo = posterResponse.data;
        setPoster({
          displayName: posterResponseInfo.displayName,
          userName: posterResponseInfo.userName,
          userId: posterResponseInfo._id,
          status: posterResponseInfo.status,
          bio: posterResponseInfo.biography,
          pfp: posterResponseInfo.imageURL,
        });
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }

    try {
      const commentsResponse = await axios.get(`http://localhost:3001/api/comments/post/${_id}`);
      console.log(`Comments are:`, commentsResponse.data);
      setComments(commentsResponse.data);

      for (const comment of commentsResponse.data) {
        console.log("comment:", comment);

        try {
          const commenterResponse = await axios.get(`http://localhost:3001/api/user/${comment.user}`);
          console.log("commenter response:", commenterResponse.data);

          if (!commenters[commenterResponse.data["_id"]]) {
            setCommenters(prevCommenters => ({
              ...prevCommenters,
              [commenterResponse.data["_id"]]: commenterResponse.data
            }));
          }
        } catch (err) {
          console.log("Error fetching user data:", err);
        }
      }
    } catch (err) {
      console.log("Error fetching comments:", err);
    }

    setLoading(false);
  };

  fetchData();
}, []);
  
  useEffect(()=>{
    axios.post("http://localhost:3001/api/posts/action", {"postId": _id, "actionType": "view"});
  }, [])

  const handleCommentChange = (e) => {
    setNewComment({ ...newComment, [e.target.name]: e.target.value });
  }

const handleReplyChange = (e) => {
    setReplyComment({ ...replyComment, [e.target.name]: e.target.value });
  }

  const handleComment = async () => {
    const tempNewComment = (await axios.post(`http://localhost:3001/api/comments`, {"comment": newComment, "postId": post[0]._id})).data
    console.log("tempNEWCOMMENT:")
    console.log(tempNewComment)
    setComments((prevComments) => [tempNewComment, ...prevComments]);
    setNewComment({
      text: "",
      isRoot: true
    })
    axios.get(`http://localhost:3001/api/user/${tempNewComment.user}`)
      .then(response => {
        console.log("commenter response:", response.data);

        if (!commenters[response.data["_id"]]) {
          setCommenters(prevCommenters => ({
            ...prevCommenters,
            [response.data["_id"]]: response.data
          }));
        }
      })
      .catch(err => {
        console.log("Error fetching user data:", err);
      });

  }



  const handleLikeComment = async (id) => {
  
  }
  
  const handleReplyPopup = (comment) => {
    console.log("red")
    setCurrentComment(comment);
    setReplyPopupOpen(true);
  }
  
  const closeReplyPopup = () => {
    setCurrentComment(null);
    setReplyComment({
      text: "",
      isRoot: false
    })

    setReplyPopupOpen(false)
  }

  const handleReplyComment = () => {
  
  }

  return (
    <div className="post-content-container">
      <div className="post-content-content">
        <div className="scrollable-container">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Post
              key={post[0]._id}
              post={post[0]}
              poster={poster}
              postEvent={postEvent}
              setPost={setPost}
            />

          )}
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
            {comments.length === 0 ? (
                <div 
                  className="empty-message">
                  <h2> Nothing Here Yet </h2>
                  <p> Add a comment to this post!</p>
                </div>
            ) : (
              comments.map(comment => {
                const commentUser = commenters[comment.user]; 
                return (
                  <div className="comment" key={comment._id}> 
                    <div className="post-header">
                      <img 
                        src={commentUser?.imageURL ? commentUser.imageURL : profilePic} 
                        alt="PostProfile" 
                        className="post-profilepic" 
                      />

                      <div className="post-profile-info">
                        <div className="post-name">{commentUser?.displayName}</div>
                        <div className="post-username">@{commentUser?.userName}</div>
                      </div>
                    </div>

                    <div className="comment-content">
                      {comment.text}
                    </div>

                    <div className="comment-buttons buttons">
                      <img onClick={() => handleLikeComment()} src={likeIcon} alt="Like" className="like-icon post-icon" />
                      <div className="likes-num num"> {0} </div>
                      <img onClick={()=>{handleReplyPopup(comment)}}src={commentIcon} alt="Comment" className="comment-icon post-icon"/> 
                      <div className="comment-num num">{0}</div>
                    </div>


                  </div>
                );
              })
            )}


          </div>
        </div>

        {isReplyPopupOpen && (
          <div className="reply-popup">
            <div className="reply-content">
              <h2>Reply</h2>
              <textarea 
                name="text"
                value={replyComment?.text || ''} 
                className="reply-textarea"
                onChange={handleReplyChange}  
                placeholder="Enter your reply"
                rows="5"
                cols="30"
              />

              <button onClick={handleReplyComment} className="reply-button">Reply</button>
              <button onClick={()=> {closeReplyPopup()}} className="close-button">x</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostContent;


