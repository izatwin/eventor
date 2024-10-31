import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import eventIcon from './icons/event.png'
import checkIcon from './icons/check.png'
import removeIcon from './icons/remove.png'
import expandIcon from './icons/expand.png'
import commentIcon from './icons/comment.png'

import axios from 'axios'
import { useState, useEffect, useRef } from 'react';

import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../AuthContext'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import likedIcon from './icons/liked.png'
import shareIcon from './icons/share.png'
import { usePopup } from '../PopupContext';


const ProfileContent= () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();  
  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [posts, setPosts] = useState([]);
  const [eventsById, setEventsById] = useState({});
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [isAddEventPopupOpen, setAddEventPopupOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
  const [newPost, setNewPost] = useState({
    content : "", 
    is_event : "false",
    commentsEnabled: "false",
    userId: user.userId,
  })
  
  const [isFollowing, setIsFollowing] = useState(false)

  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("")
  
  const [eventStep, setEventStep] = useState("select-type")
    
  const { showSharePopup, updateShareCount, updateLike } = usePopup();

  const [isBlocked, setIsBlocked] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)

  const defaultNewEvent = {
    eventType : "",
    eventName: "",
    eventDescription: "",
    startTime : "",
    endTime : "",
    embeddedImage : "",
    gaugeInterest : false,
    interestedUsers: [],
    interestTags: [],
    
    // NormalEvent
    location: "",
    
    // MusicReleaseEvent
    releaseTitle: "",
    releaseArtist: "",
    releaseType: "", // 'single, 'ep', 'album'
    songs: [{                     
        songTitle: "",
        songArtist: "",
        songDuration: ""
    }],
    appleMusicLink: "",           
    spotifyLink: "",              

    // TicketedEvent
    getTicketsLink: "",           
    destinations: [{              
        location: "",
        time: ""                   
    }]
  }

  const [newEvent, setNewEvent] = useState(defaultNewEvent)
  const { profileId } = useParams();  
  
  const [profileUser, setProfileUser] = useState({
    displayName: "",
    userName: "",
    userId : "",
    status: "",
    bio: "",
    pfp: "",
    followers: []
  });
  
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const observer = useRef(null); 
  
  useEffect(() => {
    
    const validateAndGetProfileUser = async () => {
      try {
        // validate the user
        const validateResponse = await axios.get("http://localhost:3001/api/user/validate") 
          console.log("validate response: ")
          console.log(validateResponse);

          if (validateResponse.status === 200) {
            if (!validateResponse.data['logged-in']) {
              navigate("/")
            }
            const userInfo = validateResponse.data["user-info"];
            setUser({    
              email: userInfo.email,
              displayName: userInfo.displayName,
              userName: userInfo.userName,
              userId : userInfo.userId, 
              bio: userInfo.biography,
              status: userInfo.status,
              pfp: userInfo.imageURL,
              likedPosts: userInfo.likedPosts
            })
            // TODO
            console.log("profileId: " + profileId) 
            const profileUserResponse = (await axios.get(`http://localhost:3001/api/user/${profileId}`)).data;
            console.log("pro res:")
            console.log(profileUserResponse)
            setProfileUser({
              displayName: profileUserResponse.displayName,
              userName: profileUserResponse.userName,
              userId : profileUserResponse._id,
              status: profileUserResponse.status,
              bio: profileUserResponse.biography,
              pfp: profileUserResponse.imageURL,
              followers: profileUserResponse.followers,
            })
            setNewPost(prevPost => ({
              ...prevPost,
              userId: userInfo.userId,
            }));
            console.log("userId="+userInfo.userId)
            console.log("profileId="+profileId)
            setIsOwnProfile(userInfo.userId===profileId)
            const blockStatusResponse = (await axios.get(`http://localhost:3001/api/user/block-status/${profileId}`)).data
            console.log("block-status response:")
            console.log(blockStatusResponse) 
            const isBlockingResponse = blockStatusResponse['blockingThem']
            const isBlockedResponse = blockStatusResponse['blockingUs']
            console.log("isBlocking="+isBlockingResponse)
            console.log("isBlocked="+isBlockedResponse)
            setIsBlocking(isBlockingResponse)
            setIsBlocked(isBlockedResponse)

            setIsFollowing(userInfo.following.includes(profileId))
            
            if (!isBlockedResponse && !isBlockingResponse) {
              /* postResponse is a list of post ids */
              const postResponse = (await axios.get(`http://localhost:3001/api/user/${profileId}/posts/`)).data
              console.log("post res: ")
              console.log(postResponse) 
              const postContents = []
              /* make request to get the content of each post using id */ 
              for (const currentPost of postResponse) {
                const curPostData = (await axios.get(`http://localhost:3001/api/posts/${currentPost}`)).data
                postContents.push(curPostData)

                if (curPostData.eventId) {
                  if (!eventsById[curPostData.eventId]) {
                    const event = (await axios.get(`http://localhost:3001/api/events/${curPostData.eventId}`)).data
                    setEventsById(prevEvents => ({
                      ...prevEvents,
                      [curPostData.eventId]: event
                    }));

                  }
                }
              }

              /* pass an array of posts to setPosts */
              /* sort posts */
              console.log("postContents:") 
              console.log(postContents) 
              setPosts(postContents)
            }
          }
          else {
            navigate("/");
          }
      } catch (err) {
        console.log("err");
        console.log(err)
      }
    }

    validateAndGetProfileUser();

  }, [])


  const handleFollow = () => {
    // api req to follow/unfollow userId 
    if (isFollowing) {
      axios.post("http://localhost:3001/api/user/unfollow", {"userId": profileUser.userId})
      setProfileUser(prevProfileUser => ({
        ...prevProfileUser,
        followers: prevProfileUser.followers.filter(followerId => followerId !== user.userId)
      }));
    }
    else {
      axios.post("http://localhost:3001/api/user/follow", {"userId": profileUser.userId})
      setProfileUser(prevProfileUser => ({
        ...prevProfileUser,
        followers: prevProfileUser.followers.includes(user.userId)
          ? prevProfileUser.followers 
          : [...prevProfileUser.followers, user.userId] 
      }));
    }

    setIsFollowing(!isFollowing) 

  }

  const handleBlock = () => {
    // api req to block/unblock userId 
    if (isBlocking) {
      // unblock
      axios.post("http://localhost:3001/api/user/block", {"userId": profileUser.userId, "block": false})
    }
    else {
      // block
      axios.post("http://localhost:3001/api/user/block", {"userId": profileUser.userId, "block": true})
    }

    setIsBlocking(!isBlocking) 

  }

  useEffect(() => {
    setBio(profileUser.bio || "No bio yet!");
    setStatus(profileUser.status || "No status yet!");
  }, [profileUser.bio, profileUser.status]);
  







const viewedPosts = new Set(); 

const trackViewCount = async (postId) => {
  if (viewedPosts.has(postId)) return; 

  try {
    await axios.post("http://localhost:3001/api/posts/action", {
      postId: postId, 
      actionType: "view"
    });
    console.log(`Post ${postId} is viewed.`);
    viewedPosts.add(postId); 
  } catch (error) {
    console.error(`Error updating view count for post ${postId}:`, error);
  }
};

useEffect(() => {
  observer.current = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const postId = entry.target.dataset.postId;
        trackViewCount(postId); 
        observer.current.unobserve(entry.target); 
      }
    });
  });

  const postElements = document.querySelectorAll('.post');
  postElements.forEach((postElement) => {
    observer.current.observe(postElement);
  });

  return () => {
    postElements.forEach((postElement) => {
      observer.current.unobserve(postElement);
    });
  };
}, []); 








  const changeBio = (e) => {
    setBio(e.target.value);
  }

  const handleBioEdit = () => {
    console.log("Handle change triggered");
    setEditingBio(true); 
  };

  const handleBioChange = () => {
    const bioChange = async () => {
    try {
      const params = {
        biography: bio,
      }
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/biography`, params);  
      console.log("change bio response: ")
      console.log(response);
      if (response.status === 200) {    
        setUser(prevUser  => ({
          ...prevUser, 
          bio: bio,  
        }));
      }
      else {
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

    bioChange();
    setEditingBio(false); 
  };
  
  const changeStatus = (e) => {
    setStatus(e.target.value);
  }

  const handleStatusEdit = () => {
    console.log("Handle change triggered");
    setEditingStatus(true); 
  };


  const handleStatusChange = () => {
 
    const statusChange = async () => {
    try {
      const params = {
        status: status,
      }
      const response = await axios.post(`http://localhost:3001/api/user/${user.userId}/status`, params);  
      console.log("status response: ")
      console.log(response);
      if (response.status === 200) {    
        setUser((prevUser) => ({
          ...prevUser, 
        status: status,  
        }));
      }
      else {
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

    statusChange();
    setEditingStatus(false); 

  };
  
  const handlePostChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
    console.log(newPost);
  };

  const handlePost = async () => {
    try {
      console.log(newPost);
      const response = await axios.post("http://localhost:3001/api/posts", newPost);
      console.log("posting res: ");
      console.log(response.data);
      showSuccessPopup("Post created successfully!");
      setNewPost({ ...newPost, content: "" });
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      console.log("RETURNING: " + response.data['_id']);
      return response.data['_id'];  
    } catch (err) {
      console.log(err);
      showFailPopup("Error creating post!");
      setNewPost({ ...newPost, content: "" });
      throw err; 
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };
  

  /* Function to handle a user requesting to edit their post */
  const handleEditPopup = (post, postEvent) => {
    setCurrentPost(post);  
    console.log("POSTEVENT:")
    console.log(postEvent)
    setNewEvent(postEvent)
    setEditPopupOpen(true); 
  }
  
  const closeEditPopup = () => {
    setEditPopupOpen(false);
    setCurrentPost(null);    
    setNewEvent(null);    
  };

  /* 
   * This function is called when the value of the textarea 
   * involved in editing a post is changed 
   */
  const handlePostEditChange = (e) => {
    setCurrentPost(prevPost => ({
      ...prevPost,        
      content: e.target.value 
    }));
  }

  const handlePostEdit = () => {
    const { _id, content } = currentPost;
    axios.put(`http://localhost:3001/api/posts/${_id}`, {"content": content})

    // Update the post dynamically on the page
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === _id ? { ...post, content: content } : post
      )
    );
    
    // TODO: UPDATE EVENT CALL
    
    closeEditPopup();

  }

  const handlePostDelete = (id) => {
    // api request
    axios.delete(`http://localhost:3001/api/posts/${id}`)
    .then((response) => {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      showSuccessPopup("Post deleted successfully!")
    })
    .catch((err) => {
      console.log(err);
      showFailPopup("Error deleting post");
    })
  }

const handleAddEvent = async () => {
  
  let currPostId;
  // check if the post is being added or created along side post
  if (!currentPost) {
    try {
      currPostId = await handlePost();  
      console.log('CURRPOSTID AFTER HANDLEPOST: ' + currPostId);
    } catch (err) {
      console.log("Error creating post for event:", err);
      return; 
    }
  } else {
    currPostId = currentPost._id;
  }

  const requestData = {
    postId: currPostId,
    eventType: newEvent.eventType,
    eventData: newEvent,
  };

  axios.post("http://localhost:3001/api/events", requestData)
    .then((response) => {
      setEventsById(prevEvents => ({
        ...prevEvents,
        [response.data["_id"]]: response.data
      }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === currPostId ? { ...post, "is_event": true, "eventId": response.data["_id"] } : post
        )
      );
    })
    .catch((err) => {
      console.log(err);
      showFailPopup("Error creating event.");
    });

  closeAddEventPopup();
};


  const handleAddEventPopup = (post) => {
    setCurrentPost(post);  
    setAddEventPopupOpen(true); 
    setEventStep('select-type')
    setNewEvent(defaultNewEvent)
  }

  const closeAddEventPopup = () => {
    setAddEventPopupOpen(false);
    setCurrentPost(null);    
    
  };

  const handleEventInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const addSong= () => {

    setNewEvent((prevEvent) => ({
      ...prevEvent,
      songs : [...prevEvent.songs, { songTitle: "", songArtist: "", songDuration: 0 }]
    }));
  };

  const handleSongChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSongs= [...newEvent.songs];
    updatedSongs[index][name] = value;

    setNewEvent((prevEvent) => ({
      ...prevEvent,
      songs: updatedSongs
    }));
  };


  const addDestination = () => {
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      destinations: [...prevEvent.destinations, { location: "", time: 0 }]
    }));
  };

  const handleDestinationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDestinations = [...newEvent.destinations];
    updatedDestinations[index][name] = value;

    setNewEvent((prevEvent) => ({
      ...prevEvent,
      destinations: updatedDestinations
    }));
  };

  // TODO
  const handleShare = async (id) => {
    const success = await updateShareCount(id);
    if (success) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === id ? { ...post, shares: post.shares + 1 } : post
        )
      );
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
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === id ? { ...post, likes: post.likes - 1 } : post
          )
        );

        likedPosts = likedPosts.filter(curId => curId !== id)

      }

    } else {
      // post is not liked, want to like
      success = await updateLike(id, true);
      if (success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === id ? { ...post, likes: post.likes + 1 } : post
          )
        );
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

  const [popupMessage, setPopupMessage] = useState("")
  
  const showSuccessPopup = (message) => {
    var popup = document.getElementById("success");
    setPopupMessage(message)
    popup.classList.add("show");

    setTimeout(function() {
        popup.classList.remove("show");
    }, 1000);
}

  const showFailPopup = (message) => {
    var popup = document.getElementById("fail");
    setPopupMessage(message)
    popup.classList.add("show");

    setTimeout(function() {
        popup.classList.remove("show"); 
    }, 1000);
  }

  return (
    <div className="profile-content-container">
      <div className="profile-content">
        <div className="upper-profile-card">
          
          <div className="profile-upper-container">
            <img 
              src={profileUser.pfp || profilePic} 
              alt="Profile" 
              className="profile-picture" />

            <div className="profile-information">
              <div className="p-name">{profileUser.displayName}</div>
              <div className="p-username">@{profileUser.userName}</div>
            </div>


            <div className="profile-side"> 

              <p className="follower-count"> 
                {profileUser && profileUser.followers ? profileUser.followers.length : 0} followers 
              </p>
              {!isOwnProfile && ( 
                <div>
                  <button 
                    onClick={handleFollow}
                    className="follow-btn"> 
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                    
                  <button 
                    onClick={handleBlock}
                    className="block-btn"> 
                    {!isBlocking ? 'Block' : 'Unblock'}
                  </button>
                </div>
              )}
    

            </div>
         </div> 
          
          <div className="status-container">
          
            <textarea 
              name="status" 
              readOnly={!editingStatus} 
              className="profile-status" 
              type="text" 
              onChange={changeStatus} 
              value={status} />
            {isOwnProfile && (
              <div className="edit-card"> 
                <img 
                  src={editingStatus ? checkIcon : editIcon } 
                  onClick={editingStatus ? handleStatusChange : handleStatusEdit } 
                  alt="Edit" 
                  className="edit-icon"
                /> 
                <p className="edit-text"> Edit Status </p>
              </div>
            )}

          </div>

        </div>


        <div className="lower-profile-card">

          <div className="about-title-container">
            <h1 className="about-title"> About </h1>

            {isOwnProfile && (
            <div className="edit-bio-card"> 
              <img 
                src={editingBio ? checkIcon : editIcon} 
                onClick={editingBio ? handleBioChange : handleBioEdit} 
                alt="Edit" 
                className="edit-bio-icon"
              /> 
              <p className="edit-bio-text"> Edit Bio </p>
            </div>
            )}

          </div>
          
          <div className="about-text-container">

            <textarea 
              name="bio" 
              readOnly={!editingBio} 
              className="profile-bio" 
              type="text" 
              onChange={changeBio} 
              value={bio}
            />
          </div>

        </div>
        
        { isOwnProfile && (
          <div className="post-card">
            
            <div className="post-input">
              <textarea 
                name="content" 
                className="post-text" 
                value={newPost.content} 
                type="text" 
                onChange={handlePostChange} 
                placeholder="What will you be hosting next?"/>
            </div>

            <div className="post-buttons">
              <img 
                src={eventIcon} 
                alt="Event" 
                className="event-icon"
                onClick={() => handleAddEventPopup()} 
              /> 

              <button 
                onClick={handlePost} 
                className="post-btn"> 
                Post 
              </button> 
            </div>
              
          </div>
        )}
        
        
        <div className="profile-feed">
          {isBlocking ? (
            <div className="empty-message">
              <h2 className="block-message">This User is Blocked</h2>
              <p>You won't see posts from this user.</p>
            </div>
          ) : isBlocked ? (
            <div className="empty-message">
              <h2 className="block-message">This user has you blocked</h2>
              <p>You do not have permission to view this user's post.</p>
            </div>
          ) : posts.length === 0 ? (
            isOwnProfile ? (
              <div className="empty-message">
                <h2>Nothing Here Yet</h2>
                <p>Create a post for it to show up on your profile!</p>
              </div>
            ) : (
              <div className="empty-message">
                <h2>Nothing Here Yet</h2>
                <p>Come back later!</p>
              </div>
            )
          ) : (
              posts.map((post) => {
                const postEvent = post.eventId && eventsById[post.eventId]
                const isLiking = user.likedPosts.includes(post._id)
                return (
                  <div className="post" key={post._id} data-post-id={post._id}>

                    <div className="post-header"> 

                    <img
                      src={profileUser.pfp || profilePic} 
                      alt="PostProfile" 
                      className="post-profilepic" 
                    />
                    
                    <div className="post-profile-info">
                      <div className="post-name">{profileUser.displayName}</div>
                      <div className="post-username">@{profileUser.userName}</div>
                    </div>      
                    
                    {isOwnProfile && (
                      <div className="modify-post">
                        {!postEvent && ( 
                          <button 
                            onClick={() => handleAddEventPopup(post)} 
                            className="add-event-btn"> 
                            Add Event 
                          </button> 
                        )}
                        <img 
                          src={editIcon} 
                          onClick={() => handleEditPopup(post, postEvent)} 
                          alt="Edit" 
                          className="edit-post-icon " 
                        />
                        <img 
                          src={removeIcon} 
                          onClick={() => handlePostDelete(post._id)}   
                          alt="Remove" 
                          className="remove-icon " 
                        />
                      </div>
                    )}

                    </div>

                    <div className="post-content"> 
                      {post.content}
                    </div>

      

                    {postEvent &&  (
                      <div className="event"> 
                        <h1 
                          className="event-name"> 
                          {postEvent.eventName} 
                        </h1>
                        <p 
                          className="event-description"> 
                          {postEvent.eventDescription} 
                        </p>
                        {(postEvent.startTime || postEvent.endTime) && (
                          <div className="event-times"> 
                            {postEvent.startTime ? new Date(postEvent.startTime).toLocaleString() : ""} 
                            {postEvent.startTime && postEvent.endTime ? " - " : ""}
                            {postEvent.endTime ? new Date(postEvent.endTime).toLocaleString() : ""}
                          </div>
                        )}                 
                        {postEvent.embeddedImage && (
                          <img
                            src={postEvent.embeddedImage} 
                            alt="Event Image" 
                            className="event-embeddedImage" 
                          />
                        )}
                        
                        {postEvent.type === "NormalEvent" && (
                          <p className="event-location"> Location: {postEvent.location} </p>
                        )}
                        
                        {postEvent.type === "MusicReleaseEvent" && (
                          <div>
                            <h2 className="event-release-title"> <b> {postEvent.releaseTitle} </b> </h2>
                            <p className="event-release-artist"> {postEvent.releaseArtist} </p>
                            <p className="event-release-type"> [{postEvent.releaseType}] </p> 
          
                            {postEvent.songs.map((song, index) => (
                                <div className="event-song" key={index}> 
                                  {index + 1}. {song.songTitle} ({song.songArtist}) [{song.songDuration}]
                                </div>
                            ))}
                            <br/>
                            <i> Apple Music: </i> <a href={postEvent.appleMusicLink} style= {{color: 'black'}}> {postEvent.appleMusicLink} </a>  <br/>
                            <i> Spotify: </i> <a href={postEvent.spotifyLink} style= {{color: 'black'}} > {postEvent.spotifyLink} </a> <br/> <br/>

      
                          </div>
                        )}
                        {postEvent.type === "TicketedEvent" && (
                          <div>
                            <i> Get Tickets: </i> <a href={postEvent.getTicketsLink} style= {{color: 'black'}}> {postEvent.getTicketsLink} </a>  <br/><br/>
                            {postEvent.destinations.map((destination, index) => (
                                <div className="event-destination"> 
                                  {index + 1}. {destination.location} ({destination.time})
                                </div>
                            ))}
                            <br/>
                          </div>
                        )}
                        
                      </div>
                    )}
                    
                    <div className="post-buttons">

                    <img src={viewIcon} alt="View" className="view-icon post-icon"/> 
                    <div className="views-num num">{post.views}</div>
                    <img onClick={() => { handleLike(post._id) }} src={isLiking ? likedIcon : likeIcon} alt="Like" className="like-icon post-icon"/> 
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
                )})
          )}
        </div>
        
        {isEditPopupOpen && (
          <div className="edit-popup">
            <div className="edit-popup-content">
              <h2>Edit post</h2>
              <textarea 
                value={currentPost?.content || ''} 
                className="edit-post-textarea"
                onChange={handlePostEditChange}  
                placeholder="Edit your post"
                rows="5"
                cols="30"
              />

              <button 
                onClick={closeEditPopup} 
                className="close-button">
                x
              </button>
              
              {/* EDIT EVENT */}
              {(newEvent?.type) && (
                <div>
                  <h2>Edit event</h2>
              
                  <form>

                    <input 
                      type="text" 
                      placeholder="Name" 
                      name="eventName" 
                      className="input-field" 
                      value={newEvent.eventName}
                      onChange={handleEventInputChange}
                    />
                    <textarea 
                      placeholder="Description"
                      name="eventDescription" 
                      className="input-field textarea-field" 
                      value={newEvent.eventDescription}
                      onChange={handleEventInputChange}
                    />
                    <input 
                      type="text" 
                      placeholder="Image URL" 
                      name="embeddedImage" 
                      className="input-field" 
                      value={newEvent.embeddedImage}
                      onChange={handleEventInputChange}
                    />

                    <div className="time-fields">
                      <input 
                        type="datetime-local" 
                        name="startTime" 
                        className="input-field" 
                        value={newEvent.startTime}
                        onChange={handleEventInputChange}
                      />
                      <span className="time-separator">-</span>
                      <input 
                        type="datetime-local" 
                        name="endTime" 
                        className="input-field" 
                        value={newEvent.endTime}
                        onChange={handleEventInputChange}
                      />
                    </div>

                  </form>


                </div>

              )}

              {newEvent?.type === "NormalEvent" && (

                <div>
                  <input 
                    type="text" 
                    placeholder="Address" 
                    name="location" 
                    className="input-field" 
                    value={newEvent.location}
                    onChange={handleEventInputChange}
                  />
                </div>

              )}

              {newEvent?.type === "MusicReleaseEvent" && (
                <div> 

                  <input 
                    type="text" 
                    placeholder="Release Title" 
                    name="releaseTitle" 
                    className="input-field" 
                    value={newEvent.releaseTitle}
                    onChange={handleEventInputChange}
                  />
                  <input 
                    type="text" 
                    placeholder="Release Artist" 
                    name="releaseArtist" 
                    className="input-field" 
                    value={newEvent.releaseArtist}
                    onChange={handleEventInputChange}
                  />

                   <input 
                    type="text" 
                    placeholder="Apple Music Link" 
                    name="appleMusicLink" 
                    className="input-field" 
                    value={newEvent.appleMusicLink}
                    onChange={handleEventInputChange}
                  />
                   <input 
                    type="text" 
                    placeholder="Spotify Link" 
                    name="spotifyLink" 
                    className="input-field" 
                    value={newEvent.spotifyLink}
                    onChange={handleEventInputChange}
                  />
                  <div className="select-release-type">
                    <button 
                      className={`release-type-btn ${newEvent.releaseType === 'single' ? 'selected' : ''}`}
                      onClick={() => 
                        setNewEvent((prevEvent) => ({
                          ...prevEvent,
                          releaseType: 'single' 
                        }))
                      }>
                      Single 
                    </button>
                    
                    <button 
                      className={`release-type-btn ${newEvent.releaseType === 'ep' ? 'selected' : ''}`}
                      onClick={() => 
                        setNewEvent((prevEvent) => ({
                          ...prevEvent,
                          releaseType: 'ep' 
                        }))
                      }>
                      EP 
                    </button>
                    
                    <button 
                      className={`release-type-btn ${newEvent.releaseType === 'album' ? 'selected' : ''}`}
                      onClick={() => 
                        setNewEvent((prevEvent) => ({
                          ...prevEvent,
                          releaseType: 'album' 
                        }))
                      }>
                      Album 
                    </button>

                  </div>

                
                  <h4>Songs</h4>
                  <div className="add-event-input"> 
                    {newEvent.songs.map((song, index) => (
                      <div key={index} className="song-input-group">
                        <h5> {index + 1} </h5>
                        <input 
                          type="text" 
                          placeholder="Title" 
                          name="songTitle" 
                          value={song.songTitle}
                          onChange={(e) => handleSongChange(index, e)}
                          className="input-field" 
                        />
                        <input 
                          type="text" 
                          placeholder="Artist" 
                          name="songArtist" 
                          value={song.songArtist}
                          onChange={(e) => handleSongChange(index, e)}
                          className="input-field" 
                        />
                        <input 
                          type="text" 
                          placeholder="Duration" 
                          name="songDuration" 
                          value={song.songDuration}
                          onChange={(e) => handleSongChange(index, e)}
                          className="input-field" 
                        />
                      </div>
                    ))}

                  </div>

                  <button
                    onClick={addSong} 
                    className="add-button"> 
                    + 
                  </button>

                </div>

              )}

              {newEvent?.type === "TicketedEvent" && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Ticket Link" 
                    name="getTicketsLink" 
                    className="input-field" 
                    value={newEvent.getTicketsLink}
                    onChange={handleEventInputChange}
                  />


                  <h4>Destinations</h4>

                  <div className="add-event-input"> 
                    {newEvent.destinations.map((destination, index) => (
                      <div key={index} className="destination-input-group">
                        <h5> {index + 1} </h5>
                        <input 
                          type="text" 
                          placeholder="Location" 
                          name="location" 
                          value={destination.location}
                          onChange={(e) => handleDestinationChange(index, e)}
                          className="input-field" 
                        />
                        <input 
                          type="text" 
                          placeholder="Time" 
                          name="time" 
                          value={destination.time}
                          onChange={(e) => handleDestinationChange(index, e)}
                          className="input-field" 
                        />
                      </div>
                    ))}

                  </div>

                  <button onClick={addDestination} className="add-button"> + </button>
                  
                </div>
              )}
              <button 
                onClick={handlePostEdit} 
                className="save-button">
                Save
              </button>


            </div>
          </div>
        )}
    
        {isAddEventPopupOpen && (
          <div className="add-event-popup">

            {eventStep === "select-type" && (
              <div className="add-event-content">
                <h2>Select event type</h2>
           
                <button 
                  onClick={() => {
                      setNewEvent(prevEvent => ({
                        ...prevEvent,  
                        eventType: 'NormalEvent'
                      })); 
                      setEventStep("normal")
                    }
                  } 
                  className="event-type-btn"> 
                  Normal
                </button>

                <button 
                  onClick={() => {
                      setNewEvent(prevEvent => ({
                        ...prevEvent,  
                        eventType: 'MusicReleaseEvent'
                      })); 
                      setEventStep("music-release")
                    }
                  } 
                  className="event-type-btn">
                  Music Release
                </button>

                <button 
                  onClick={() => {
                      setNewEvent(prevEvent => ({
                        ...prevEvent,  
                        eventType: 'TicketedEvent'
                      })); 
                      setEventStep("ticketed")
                    }
                  } 
                  className="event-type-btn">
                  Ticketed
                </button>

                <button 
                  onClick={closeAddEventPopup} 
                  className="close-button">
                  x
                </button>
              </div>
            )}

            {(eventStep === "normal" || eventStep === "music-release" || eventStep === "ticketed") && (
              <div className="add-event-content">
                <h2>Create event</h2>
            
                <form>

                  <input 
                    type="text" 
                    placeholder="Name" 
                    name="eventName" 
                    className="input-field" 
                    value={newEvent.eventName}
                    onChange={handleEventInputChange}
                  />
                  <textarea 
                    placeholder="Description"
                    name="eventDescription" 
                    className="input-field textarea-field" 
                    value={newEvent.eventDescription}
                    onChange={handleEventInputChange}
                  />
                  <input 
                    type="text" 
                    placeholder="Image URL" 
                    name="embeddedImage" 
                    className="input-field" 
                    value={newEvent.embeddedImage}
                    onChange={handleEventInputChange}
                  />

                  <div className="time-fields">
                    <input 
                      type="datetime-local" 
                      name="startTime" 
                      className="input-field" 
                      value={newEvent.startTime}
                      onChange={handleEventInputChange}
                    />
                    <span className="time-separator">-</span>
                    <input 
                      type="datetime-local" 
                      name="endTime" 
                      className="input-field" 
                      value={newEvent.endTime}
                      onChange={handleEventInputChange}
                    />
                  </div>

                </form>
                <button 
                  onClick={ () => { 
                    setEventStep(prevEventStep => prevEventStep + "2")
                    }
                  } 
                  className="add-event-button">
                  Continue
                </button>
                <button 
                  onClick={closeAddEventPopup} 
                  className="close-button">
                  x
                </button>
              </div>

            )}

            {eventStep === "normal2" && (

              <div className="add-event-content">

                <h2>Create event</h2>

                <input 
                  type="text" 
                  placeholder="Address" 
                  name="location" 
                  className="input-field" 
                  value={newEvent.location}
                  onChange={handleEventInputChange}
                />
                <button onClick={handleAddEvent} className="add-event-button">Add</button>
                <button onClick={closeAddEventPopup} className="close-button">x</button>
              </div>

            )}

            {eventStep === "music-release2" && (
              <div className="add-event-content">

                <h2>Create event</h2>

                <input 
                  type="text" 
                  placeholder="Release Title" 
                  name="releaseTitle" 
                  className="input-field" 
                  value={newEvent.releaseTitle}
                  onChange={handleEventInputChange}
                />
                <input 
                  type="text" 
                  placeholder="Release Artist" 
                  name="releaseArtist" 
                  className="input-field" 
                  value={newEvent.releaseArtist}
                  onChange={handleEventInputChange}
                />

                 <input 
                  type="text" 
                  placeholder="Apple Music Link" 
                  name="appleMusicLink" 
                  className="input-field" 
                  value={newEvent.appleMusicLink}
                  onChange={handleEventInputChange}
                />
                 <input 
                  type="text" 
                  placeholder="Spotify Link" 
                  name="spotifyLink" 
                  className="input-field" 
                  value={newEvent.spotifyLink}
                  onChange={handleEventInputChange}
                />
                <div className="select-release-type">
                  <button 
                    className={`release-type-btn ${newEvent.releaseType === 'single' ? 'selected' : ''}`}
                    onClick={() => 
                      setNewEvent((prevEvent) => ({
                        ...prevEvent,
                        releaseType: 'single' 
                      }))
                    }>
                    Single 
                  </button>
                  
                  <button 
                    className={`release-type-btn ${newEvent.releaseType === 'ep' ? 'selected' : ''}`}
                    onClick={() => 
                      setNewEvent((prevEvent) => ({
                        ...prevEvent,
                        releaseType: 'ep' 
                      }))
                    }>
                    EP 
                  </button>
                  
                  <button 
                    className={`release-type-btn ${newEvent.releaseType === 'album' ? 'selected' : ''}`}
                    onClick={() => 
                      setNewEvent((prevEvent) => ({
                        ...prevEvent,
                        releaseType: 'album' 
                      }))
                    }>
                    Album 
                  </button>

                </div>

              
                <h4>Songs</h4>
                <div className="add-event-input"> 
                  {newEvent.songs.map((song, index) => (
                    <div key={index} className="song-input-group">

                      <h5> {index + 1} </h5>
                      <input 
                        type="text" 
                        placeholder="Title" 
                        name="songTitle" 
                        value={song.title}
                        onChange={(e) => handleSongChange(index, e)}
                        className="input-field" 
                      />
                      <input 
                        type="text" 
                        placeholder="Artist" 
                        name="songArtist" 
                        value={song.artist}
                        onChange={(e) => handleSongChange(index, e)}
                        className="input-field" 
                      />
                      <input 
                        type="text" 
                        placeholder="Duration" 
                        name="songDuration" 
                        value={song.duration}
                        onChange={(e) => handleSongChange(index, e)}
                        className="input-field" 
                      />
                    </div>
                  ))}

                </div>

                <button
                  onClick={addSong} 
                  className="add-button"> 
                  + 
                </button>

                <button 
                  onClick={handleAddEvent} 
                  className="add-event-button">
                  Add
                </button>

                <button 
                  onClick={closeAddEventPopup} 
                  className="close-button">
                  x
                </button>
              
              </div>

            )}

            {eventStep === "ticketed2" && (
              <div className="add-event-content">

                <h2>Create event</h2>
                <input 
                  type="text" 
                  placeholder="Ticket Link" 
                  name="getTicketsLink" 
                  className="input-field" 
                  value={newEvent.getTicketsLink}
                  onChange={handleEventInputChange}
                />


                <h4>Destinations</h4>

                <div className="add-event-input"> 
                  {newEvent.destinations.map((destination, index) => (
                    <div key={index} className="destination-input-group">
                      <h5> {index + 1} </h5>
                      <input 
                        type="text" 
                        placeholder="Location" 
                        name="location" 
                        value={destination.location}
                        onChange={(e) => handleDestinationChange(index, e)}
                        className="input-field" 
                      />
                      <input 
                        type="text" 
                        placeholder="Time" 
                        name="time" 
                        value={destination.time}
                        onChange={(e) => handleDestinationChange(index, e)}
                        className="input-field" 
                      />
                    </div>
                  ))}

                </div>


                <button onClick={addDestination} className="add-button"> + </button>
                <button onClick={closeAddEventPopup} className="close-button">x</button>
                <button onClick={handleAddEvent} className="add-event-button">Add</button>
                
              </div>
            )}

          </div>

        )}

        <div className="postPopups">
          <div className="popup" id="success">{popupMessage}</div>
          <div className="popup" id="fail">{popupMessage}</div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfileContent;


