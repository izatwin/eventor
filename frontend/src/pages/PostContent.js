import "../styles/PostContent.css";
import { useState, useEffect} from 'react';

import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'

import profilePic from './icons/profile.png';
import likeIcon from './icons/like.png'
import likedIcon from './icons/liked.png'
import commentIcon from './icons/comment.png'
import removeIcon from '../pages/icons/remove.png'
import editIcon from '../pages/icons/edit.png'

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
  const [isCurrentCommentRoot, setIsCurrentCommentRoot] = useState(false);
  const [currentCommentRootId, setCurrentCommentRootId] = useState(null);
  const [replyComment, setReplyComment] = useState({
    text: "",
    isRoot: false,
  })
  const [replies, setReplies] = useState({})
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);


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
            likedPosts: userInfo.likedPosts,
            likedComments: userInfo.likedComments
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
        // get comments
        const commentsResponse = await axios.get(`http://localhost:3001/api/comments/post/${_id}`);
        console.log(`Comments are:`, commentsResponse.data);
        const rootComments = commentsResponse.data.filter(comment => comment.isRoot === true);
        setComments(rootComments);

        // loop through each comment
        for (const comment of commentsResponse.data) {
          console.log("comment:", comment);
        
          try {
            // get commenter of comment
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

          // get replies of comment
          if (comment.comments && comment.comments.length > 0) {
            for (const replyId of comment.comments) {
              try {
                const replyResponse = await axios.get(`http://localhost:3001/api/comments/${replyId}`);
                console.log("Reply response:", replyResponse.data);

                setReplies(prevReplies => {
                  const existingReplies = prevReplies[comment._id] || [];
                  
                  const isDuplicate = existingReplies.some(reply => reply._id === replyResponse.data._id);

                  // if not a duplicate add to replies
                  if (!isDuplicate) {
                    return {
                      ...prevReplies,
                      [comment._id]: [...existingReplies, replyResponse.data]
                    };
                  }

                  // If a duplicate, skip
                  return prevReplies;
                });            

              } catch (err) {
                console.log("Error fetching reply:", err);
              }
            }
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

  const handleComment = async (isReply) => {
    const tempNewComment = (await axios.post(`http://localhost:3001/api/comments`, {"comment": isReply ? replyComment : newComment, "postId": post[0]._id})).data
    console.log("tempNEWCOMMENT:")
    console.log(tempNewComment)
    if (isReply) {
      setReplies(prevReplies => {
        return {
          ...prevReplies, [currentComment._id]: [...(prevReplies[currentComment._id] || []), tempNewComment]
        }
      });    
      setReplyComment({
        text: "",
        isRoot: false
      })
    }
    else {
      setComments((prevComments) => [tempNewComment, ...prevComments]);
      setNewComment({
        text: "",
        isRoot: true
      })
    }
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
    return tempNewComment._id; 
  }

  const updateCommentLike= async (id, shouldLike) => {
    try {
      axios.post("http://localhost:3001/api/comments/toggle-like", {"commentId": id, "like": shouldLike})
      return true; // successfull
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  const updateCommentLikeCache = async (id, isReply, increment, rootId) => {
    if (isReply) {
      setReplies(prevComments => ({
        ...prevComments,
        [rootId]: prevComments[rootId].map(reply =>
          reply._id === id
            ? { ...reply, likes: reply.likes + increment }
            : reply
        )
      }));

    } else {
      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === id ? { ...comment, likes: comment.likes + increment } : comment
        )
      );
    }
  }


  const handleLikeComment = async (id, isReply, rootId) => {
    var success = false
    var likedComments = user.likedComments || [];
    if (likedComments.includes(id)) {
      success = await updateCommentLike(id, false);
      if (success) {
        updateCommentLikeCache(id, isReply, -1, rootId)
        likedComments = likedComments.filter(curId => curId !== id)

      }

    } else {
      success = await updateCommentLike(id, true);
      if (success) {
        updateCommentLikeCache(id, isReply, 1, rootId)
        likedComments.push(id)
      }
    }
    setUser(prevUser => ({
      ...prevUser,
      likedComments: likedComments
    }))

    if (!success) {
      console.error('Error updating like status');
    }
  };

  
  const handleReplyPopup = (comment) => {
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

  const handleReplyComment = async () => {
    console.log("new comment: ")
    console.log(newComment)
    handleComment(replyComment).then((childId)=> {
      axios.post(`http://localhost:3001/api/comments/addChild/${currentComment._id}`, {"childId": childId})
      .then(response => {
        console.log("reply response:", response.data);
      })
      .catch(err => {
        console.log("Error creating reply:", err);
      });   
    })
    .catch(err => {
      console.log("Error creating comment:", err)
    });

    setReplyPopupOpen(false)
  }

  // TODO
  const handleCommentDelete = (id, isRoot, rootId) => {
    // api request
    axios.delete(`http://localhost:3001/api/comments/${id}`)
      .then((response) => {
        if (isRoot) {
          setComments(prevComments => prevComments.filter((comment) => comment._id !== id))
        } else {
          setReplies(prevComments => ({
            ...prevComments,
            [rootId]: prevComments[rootId].filter(reply => reply._id !== id)
          }));

        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
 
  const handleEditPopup = (comment, isRoot, rootId) => {
    setCurrentComment(comment);
    setIsCurrentCommentRoot(isRoot)
    setCurrentCommentRootId(rootId)
    setEditPopupOpen(true);
  }

  const closeEditPopup = () => {
    setEditPopupOpen(false);
    setCurrentComment(null);    
  };

  /* 
   * This function is called when the value of the textarea 
   * involved in editing a comment is changed 
   */
  const handleCommentEditChange = (e) => {
    setCurrentComment(prevComment => ({
      ...prevComment,        
      text: e.target.value 
    }));
  }

  const handleCommentEdit = () => {
    // use currentComment to get id ... 
    const { _id, text: text } = currentComment;
    axios.put(`http://localhost:3001/api/comments/${_id}`, {"text": text})
      .then((response) => {
        
        if (isCurrentCommentRoot) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === currentComment._id ? { ...comment, text: text } : comment
            )
          );
        } else {
          console.log(currentComment)
          setReplies(prevComments => ({
            ...prevComments,
            [currentCommentRootId]: prevComments[currentCommentRootId].map(reply =>
              reply._id === currentComment._id
                ? { ...reply, text: currentComment.text }
                : reply
            )
          }));
        }
      })
      .catch((err) => {
        console.log(err)
      });
    closeEditPopup();
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
                onClick={()=>handleComment(false)} 
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
                const commentReplies = replies[comment._id] || []
                
                const canDelete = commentUser?.userName === user.userName || post[0].user === user.userId
                const canEdit = commentUser?.userName === user.userName
                const isLiking = user?.likedComments?.includes(comment._id);

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
                      <div className="modify-comment">

                        {(canEdit && ( 
                          <img
                              src={editIcon}
                              onClick={() => handleEditPopup(comment, true, comment._id)}
                              alt="Edit"
                              className="edit-post-icon "
                          />
                        ))}

                        {(canDelete && (
                          <img
                              src={removeIcon}
                              onClick={() => handleCommentDelete(comment._id, true, comment._id)}
                              alt="Remove"
                              className="remove-icon "
                          />
                        ))}

                      </div>

                    </div>


                    <div className="comment-content">
                      {comment.text}
                    </div>

                    <div className="comment-buttons buttons">
                      <img onClick={() => handleLikeComment(comment._id, false, comment._id)} src={isLiking ? likedIcon : likeIcon} alt="Like" className="like-icon post-icon" />
                      <div className="likes-num num"> {comment.likes} </div>
                      <img onClick={()=>{handleReplyPopup(comment)}}src={commentIcon} alt="Comment" className="comment-icon post-icon"/> 
                      <div className="comment-num num">{0}</div>
                    </div>

                    {/* Render replies of comment */}
                    {commentReplies.length > 0 && (
                      <div className="replies-section">
                        {commentReplies.map(reply => {
                          const replyUser = commenters[reply.user];
                          const isLiking = user?.likedComments?.includes(reply._id);
                          const canDeleteReply = replyUser.userName === user.userName || post[0].user === replyUser._id
                          const canEditReply = replyUser.userName === user.userName
                          return (
                            <div className="comment-reply" key={reply._id}>
                              <div className="post-header">
                                <img 
                                  src={replyUser?.imageURL ? replyUser.imageURL : profilePic} 
                                  alt="PostProfile" 
                                  className="post-profilepic" 
                                />
                                <div className="post-profile-info">
                                  <div className="post-name">{replyUser?.displayName}</div>
                                  <div className="post-username">@{replyUser?.userName}</div>
                                </div>

                                <div className="modify-reply">

                                  {(canEditReply && ( 
                                    <img
                                      src={editIcon}
                                      onClick={() => handleEditPopup(reply, false, comment._id)}
                                      alt="Edit"
                                      className="edit-post-icon "
                                    />
                                  ))}

                                  {(canDeleteReply && (
                                    <img
                                      src={removeIcon}
                                      onClick={() => handleCommentDelete(reply._id, false, comment._id)}
                                      alt="Remove"
                                      className="remove-icon "
                                    />
                                  ))}

                                </div>

                              </div>

 

                              <div className="comment-content">{reply.text}</div>
                              


                              <div className="comment-buttons buttons">
                                <img onClick={() => handleLikeComment(reply._id, true, comment._id)} src={isLiking ? likedIcon : likeIcon} alt="Like" className="like-icon post-icon" />
                                <div className="likes-num num"> {reply.likes} </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}


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
        
        {isEditPopupOpen && (
          <div className="edit-popup">
            <div className="edit-popup-content">
              <h2>Edit comment</h2>
              <textarea 
                value={currentComment?.text || ''} 
                className="edit-post-textarea"
                onChange={handleCommentEditChange}  
                placeholder="Edit your comment"
                rows="5"
                cols="30"
              />

              <button 
                onClick={closeEditPopup} 
                className="close-button">
                x
              </button>

              <button 
                onClick={handleCommentEdit} 
                className="save-button">
                Save
              </button>
            </div>
          </div>
        )}
    
      </div>
    </div>
  );
};

export default PostContent;


