import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import imageIcon from './icons/image.png'
import calendarIcon from './icons/calendar.png'
import checkIcon from './icons/check.png'
import removeIcon from './icons/remove.png'
import expandIcon from './icons/expand.png'
import commentIcon from './icons/comment.png'

import axios from 'axios'
import { useState, useEffect } from 'react';

import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../AuthContext'; 

import viewIcon from './icons/view.png'
import likeIcon from './icons/like.png'
import shareIcon from './icons/share.png'
import { usePopup } from '../PopupContext';


const ProfileContent= () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();  
  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [posts, setPosts] = useState([]);
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
  const [events, setEvents] = useState([])
  const { profileId } = useParams();  
  
  const [profileUser, setProfileUser] = useState({
    displayName: "",
    userName: "",
    userId : "",
    status: "",
    bio: "",
    pfp: "",
  });
  
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  
  useEffect(() => {
    
    const validateAndGetProfileUser = async () => {
      try {
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
            })
            setNewPost(prevPost => ({
              ...prevPost,
              userId: userInfo.userId,
            }));
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


  useEffect(()=> {
    console.log("userid="+user.userId) 
    console.log("profileuserid="+profileUser.userId) 
    setIsOwnProfile(user.userId===profileUser.userId)
    const checkBlockedAndGetPosts = async () => {
      try {
        setIsBlocked((await axios.get(`http://localhost:3001/api/user/block-status/${profileUser.userId}`)).data['blockingThem'])
        
        console.log(isBlocked)

        /* postResponse is a list of post ids */
        const postResponse = (await axios.get(`http://localhost:3001/api/user/${profileUser.userId}/posts/`)).data
        console.log("post res: ")
        console.log(postResponse) 
        const postContents = []
        /* make request to get the content of each post using id */ 
        for (const currentPost of postResponse) {
          postContents.push(((await axios.get(`http://localhost:3001/api/posts/${currentPost}`)).data))
        }
        
        /* pass an array of posts to setPosts */
        /* sort posts */
        console.log("postContents:") 
        console.log(postContents) 
        setPosts(postContents)
      } catch (err) {
          console.log("err");
          console.log(err)
      }
    }
    checkBlockedAndGetPosts();
  }, [profileUser.userId])
  
  const handleFollow = () => {
    // api req to follow/unfollow userId 
    if (isFollowing) {
      axios.post("http://localhost:3001/api/user/unfollow", {"userId": profileUser.userId})
    }
    else {
      axios.post("http://localhost:3001/api/user/follow", {"userId": profileUser.userId})
    }

    setIsFollowing(!isFollowing) 

  }

  const handleBlock = () => {
    // api req to block/unblock userId 
    if (isBlocked) {
      // unblock
      axios.post("http://localhost:3001/api/user/block", {"userId": profileUser.userId, "block": false})
    }
    else {
      // block
      axios.post("http://localhost:3001/api/user/block", {"userId": profileUser.userId, "block": true})
    }

    setIsBlocked(!isBlocked) 

  }

  useEffect(() => {
    setBio(profileUser.bio || "No bio yet!");
    setStatus(profileUser.status || "No status yet!");
  }, [profileUser.bio, profileUser.status]);
  
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

  const handlePost = () => {
    console.log(newPost)
    axios.post("http://localhost:3001/api/posts", newPost)
      .then(response => {
        console.log("posting res: ")
        console.log(response.data)
        showSuccessPopup("Post created successfully!"); 
        setNewPost({ ...newPost, content: "" });
        setPosts((prevPosts) => [response.data, ...prevPosts]);
      })
      .catch (err => {
        console.log(err)
        showFailPopup("Error creating post!"); 
        setNewPost({ ...newPost, content: "" })
      });
  }

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
  const handleEditPopup = (post) => {
    setCurrentPost(post);  
    setEditPopupOpen(true); 
  }
  
  const closeEditPopup = () => {
    setEditPopupOpen(false);
    setCurrentPost(null);    
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

  /* TODO: Function to add/create an event */
  const handleAddEvent = () => {
    // api request   
    console.log(newEvent)
    const requestData = {
      "postId": currentPost._id,
      "eventType": newEvent.eventType,
      "eventData": newEvent
    }
    axios.post("http://localhost:3001/api/events",  requestData )
    setEvents([newEvent]);
    closeAddEventPopup();
  }  

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

              <p className="follower-count"> 0 followers </p>
              {isOwnProfile && ( 
                <div>
                  <button 
                    onClick={handleFollow}
                    className="follow-btn"> 
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                    
                  <button 
                    onClick={handleBlock}
                    className="block-btn"> 
                    {!isBlocked ? 'Block' : 'Unblock'}
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
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <img 
                src={imageIcon} 
                onClick={handleUploadClick} 
                alt="Image" 
                className="image-icon"
              /> 
              <img 
                src={calendarIcon} 
                alt="Calendar" 
                className="calendar-icon"
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
          {posts.length === 0 ? (
            isOwnProfile ? (
              <div 
                className="empty-message">
                <h2> Nothing Here Yet </h2>
                <p> Create a post for it to show up on your profile! </p>
              </div>
            ) : (
              <div 
                className="empty-message">
                <h2> Nothing Here Yet </h2>
                <p> Come back later! </p>
              </div>
            )
          

          ) : (
            posts.map(post=>(
              <div className="post" key={post._id}> 

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
                      <button 
                        onClick={() => handleAddEventPopup(post)} 
                        className="add-event-btn"> 
                        Add Event 
                      </button> 
                      <img 
                        src={editIcon} 
                        onClick={() => handleEditPopup(post)} 
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

  

                {newEvent.eventType !== "" && (
                  <div className="event"> 
                    <h1 
                      className="event-name"> 
                      {newEvent.eventName} 
                    </h1>
                    <p 
                      className="event-description"> 
                      {newEvent.eventDescription} 
                    </p>
                    <div 
                      className="event-times"> 
                      {newEvent.startTime}-{newEvent.endTime}
                    </div> 
                    <img
                      src={newEvent.embeddedImage} 
                      alt="event-embeddedImage" 
                      className="event-embeddedImage" 
                    />
                    
                    {newEvent.eventType === "NormalEvent" && (
                      <p className="event-location"> Location: {newEvent.location} </p>
                    )}
                    {newEvent.eventType === "MusicReleaseEvent" && (
                      <div>
                        <h2 className="event-release-title"> <b> {newEvent.releaseTitle} </b> </h2>
                        <p className="event-release-artist"> {newEvent.releaseArtist} </p>
                        <p className="event-release-type"> [{newEvent.releaseType}] </p> 
      
                        {newEvent.songs.map((song, index) => (
                            <div className="event-song" key={index}> 
                              {index + 1}. {song.songTitle} ({song.songArtist}) [{song.songDuration}]
                            </div>
                        ))}
                        <br/>
                        <i> Apple Music: </i> <a href={newEvent.appleMusicLink} style= {{color: 'black'}}> {newEvent.appleMusicLink} </a>  <br/>
                        <i> Spotify: </i> <a href={newEvent.spotifyLink} style= {{color: 'black'}} > {newEvent.spotifyLink} </a> <br/> <br/>

  
                      </div>
                    )}
                    {newEvent.eventType === "TicketedEvent" && (
                      <div>
                        <i> Get Tickets: </i> <a href={newEvent.getTicketsLink} style= {{color: 'black'}}> {newEvent.getTicketsLink} </a>  <br/><br/>
                        {newEvent.destinations.map((destination, index) => (
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
                  <img onClick={() => { handleLike(post._id) }} src={likeIcon} alt="Like" className="like-icon post-icon"/> 
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
              
            ))
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
                onClick={handlePostEdit} 
                className="save-button">
                Save
              </button>
              <button 
                onClick={closeEditPopup} 
                className="close-button">
                x
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
                      type="date" 
                      name="startTime" 
                      className="input-field" 
                      value={newEvent.startTime}
                      onChange={handleEventInputChange}
                    />
                    <span className="time-separator">-</span>
                    <input 
                      type="date" 
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


