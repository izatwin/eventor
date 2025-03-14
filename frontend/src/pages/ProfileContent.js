import "../styles/ProfileContent.css";
import profilePic from './icons/profile.png'; 
import editIcon from './icons/edit.png'
import eventIcon from './icons/event.png'
import imageIcon from './icons/image.png'
import checkIcon from './icons/check.png'
import removeIcon from './icons/remove.png'

import axios from 'axios'
import { useState, useEffect } from 'react';

import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../AuthContext'; 
import { usePopup } from '../PopupContext';
import DropdownButton from "../components/NotificationButton";

import Post from '../components/Post';


const ProfileContent= () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();  
  const { showOffensivePopup, showSuccessPopup, showFailPopup} = usePopup();
  
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [posts, setPosts] = useState([]);
  const [eventsById, setEventsById] = useState({});
  const [isEditPopupOpen, setEditPopupOpen] = useState(false);
  const [isAddEventPopupOpen, setAddEventPopupOpen] = useState(false);
  const [isAddImage, setIsAddImage] = useState(false);
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

  useEffect(() => {
    
    const validateAndGetProfileUser = async () => {
      try {
        // validate the user
        const validateResponse = await axios.get(process.env.REACT_APP_API_URL + "/api/user/validate") 
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
            const profileUserResponse = (await axios.get(process.env.REACT_APP_API_URL + `/api/user/${profileId}`)).data;
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
            const blockStatusResponse = (await axios.get(process.env.REACT_APP_API_URL + `/api/user/block-status/${profileId}`)).data
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
              const postResponse = (await axios.get(process.env.REACT_APP_API_URL + `/api/user/${profileId}/posts/`)).data
              const postContents = []
              /* make request to get the content of each post using id */ 
              for (const currentPost of postResponse) {
                const curPostData = (await axios.get(process.env.REACT_APP_API_URL + `/api/posts/${currentPost}`)).data
                postContents.push(curPostData)

                if (curPostData.eventId) {
                  if (!eventsById[curPostData.eventId]) {
                    const event = (await axios.get(process.env.REACT_APP_API_URL + `/api/events/${curPostData.eventId}`)).data
                    setEventsById(prevEvents => ({
                      ...prevEvents,
                      [curPostData.eventId]: event
                    }));

                  }
                }
              }

              /* pass an array of posts to setPosts */
              /* sort posts */
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

  }, [profileId])


const handleFollow = async () => {
  // API request to follow/unfollow userId 
  try {
    if (isFollowing) {
      const response = await axios.post(process.env.REACT_APP_API_URL + "/api/user/unfollow", {
        userId: profileUser.userId,
      });

      if (response.status === 200) {
        setProfileUser(prevProfileUser => ({
          ...prevProfileUser,
          followers: prevProfileUser.followers.filter(followerId => followerId !== user.userId),
        }));
        setIsFollowing(false); 
      }
    } else {
      const response = await axios.post(process.env.REACT_APP_API_URL + "/api/user/follow", {
        userId: profileUser.userId,
      });

      if (response.status === 200) {
        setProfileUser(prevProfileUser => ({
          ...prevProfileUser,
          followers: prevProfileUser.followers.includes(user.userId)
            ? prevProfileUser.followers
            : [...prevProfileUser.followers, user.userId],
        }));
        setIsFollowing(true); 
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      showFailPopup("You are not allowed to follow/unfollow this user.");
    } else {
      showFailPopup("Error following/unfollowing user.");
    }
  }
};


  const handleBlock = () => {
    // api req to block/unblock userId 
    if (isBlocking) {
      // unblock
      axios.post(process.env.REACT_APP_API_URL + "/api/user/block", {"userId": profileUser.userId, "block": false})
    }
    else {
      // block
      axios.post(process.env.REACT_APP_API_URL + "/api/user/block", {"userId": profileUser.userId, "block": true})
    }

    setIsBlocking(!isBlocking) 

  }

  useEffect(() => {
    setBio(profileUser.bio || "No bio yet!");
    setStatus(profileUser.status || "No status yet!");
  }, [profileUser.bio, profileUser.status]);
  







const viewedPosts = new Set(); 

const trackViewCount = async (postId) => {
  console.log(viewedPosts)
  if (viewedPosts.has(postId)) {
    console.log("returning")
    return;
  }
  try {
    await axios.post(process.env.REACT_APP_API_URL + "/api/posts/action", {
      postId: postId, 
      actionType: "view"
    });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, views: post.views === 0 ? 1 : post.views + 1 } 
            : post
        )
      );
    console.log(`Post ${postId} is viewed.`);
    viewedPosts.add(postId); 
  } catch (error) {
    console.error(`Error updating view count for post ${postId}:`, error);
  }
};

useEffect(() => {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const postId = entry.target.dataset.postId;
        if (viewedPosts.has(postId)) {
          console.log("returning")
        }
        else {
          trackViewCount(postId); 
        }
      }
    });
  });

  const postElements = document.querySelectorAll('.post');
  postElements.forEach((postElement) => {
    observer.observe(postElement);
  });

  return () => {
    postElements.forEach((postElement) => {
      observer.unobserve(postElement);
    });
  };
}, [posts.length]); 








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
      const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/${user.userId}/biography`, params);  
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
      if (err.response.status === 422) {
        showOffensivePopup('Your biography contains offensive or obscene content')
        setBio(user.bio)
      }
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
      const response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/${user.userId}/status`, params);  
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
      if (err.response.status === 422) {
        showOffensivePopup('Your status contains offensive or obscene content')
        setStatus(user.status)
      }
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
      const response = await axios.post(process.env.REACT_APP_API_URL + "/api/posts", newPost);
      console.log("posting res: ");
      console.log(response.data);
      showSuccessPopup("Post created successfully!");
      setNewPost({ ...newPost, content: "", embeddedImage: "" });
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      console.log("RETURNING: " + response.data['_id']);
      return response.data['_id'];  
    } catch (err) {
      if (err.response.status === 422) {
        showOffensivePopup('Your post contains offensive or obscene content')
        setBio(user.bio)
      } else {
        showFailPopup("Error creating post!");
      }

      console.log(err);
      setNewPost({ ...newPost, content: "" });
    }
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
    console.log(e.target)
    setCurrentPost(prevPost => ({
      ...prevPost,        
      [e.target.name]: e.target.value 
    }));
  }

  const handlePostEdit = async () => {


    const { _id, content, embeddedImage } = currentPost;
    axios.put(process.env.REACT_APP_API_URL + `/api/posts/${_id}`, {"content": content, "embeddedImage": embeddedImage})
    .then(()=> {

      // Update the post dynamically on the page
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === _id ? { ...post, content: content, embeddedImage: embeddedImage } : post
        )
      );
    })
    .catch((err) => {
      if (err.response.status === 422) {
        showOffensivePopup('Your edit contains offensive or obscene content')
      }
    })
    
    // TODO: UPDATE EVENT CALL
    if (newEvent === null || newEvent === undefined) {
    } else {
      if (currentPost.eventId && currentPost.eventId === newEvent._id) {
        console.log(newEvent)
        axios.put(process.env.REACT_APP_API_URL + `/api/events/${newEvent._id}`, {"id": newEvent._id, "event": newEvent, "postId": currentPost._id})
          .then((response) => {
            setEventsById(prevEvents => ({
              ...prevEvents,
              [response.data["_id"]]: response.data
            }));
          })
          .catch((err) => {
            if (err.response.status === 422) {
              showOffensivePopup('Your edit contains offensive or obscene content')
            }
            console.log(err)
          })
      }
    }
    closeEditPopup();

  }

  const handlePostDelete = (id) => {
    // api request
    axios.delete(process.env.REACT_APP_API_URL + `/api/posts/${id}`)
    .then((response) => {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      showSuccessPopup("Post deleted successfully!")
    })
    .catch((err) => {
      console.log(err);
      showFailPopup("Error deleting post");
    })
  }

  const handleEventDelete = (id) => {
    // api request
    console.log("CURRPOSTID:" + currentPost._id)
    axios.post(process.env.REACT_APP_API_URL + `/api/events/delete/${id}`, {"postId": currentPost._id})
    .then((response) => {
      setEventsById((prevEvents) => {
        const { [id]: _, ...remainingEvents } = prevEvents; 
        return remainingEvents; 
      });
      setEditPopupOpen(false); 
      showSuccessPopup("Event deleted successfully!")
    })
    .catch((err) => {
      console.log(err);
      showFailPopup("Error deleting event");
    })
  }

const handleAddEvent = async () => {
  if (newEvent.eventType === "MusicReleaseEvent" && newEvent.releaseType === '') {
    showFailPopup("Release type required")
    return;
  }
  let shouldDeleteId;
  let currPostId;
  // check if the post is being added or created along side post
  if (!currentPost) {
    try {
      currPostId = await handlePost();  
      shouldDeleteId = true;
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
  axios.post(process.env.REACT_APP_API_URL + "/api/events", requestData)
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
      if (err.response.status === 422) {
        showOffensivePopup('Your event contains offensive or obscene content')
        if (shouldDeleteId) {
          axios.delete(process.env.REACT_APP_API_URL + `/api/posts/${currPostId}`)
        }
        
      }
      else {
        showFailPopup("Error creating event.");
      }
      console.log(err);
    });

  closeAddEventPopup();
};


  const handleAddEventPopup = (post) => {
    setCurrentPost(post);  
    setAddEventPopupOpen(true); 
    setEventStep('select-type')
    setNewEvent(defaultNewEvent)
  }

  const handleAddImageBox = (statusChange) => {
    setIsAddImage(statusChange)
  }

  const closeAddEventPopup = () => {
    setAddEventPopupOpen(false);
    setCurrentPost(null);    
    
  };

  const handleEventInputChange = (e) => {
    console.log("e.target.name: " + e.target.name + "e.target.value: " + e.target.value);
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
  
    const date = new Date(dateString);
    
    // Get the local date components
    const localDate = new Date(date.getTime());
    
    // Format to YYYY-MM-DDTHH:MM
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

const handleEventDateChange = (e) => {
  const { name, value } = e.target;

   
  setNewEvent((prevEvent) => ({
    ...prevEvent,
    [name]: value, 
  }));
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

  const [popupMessage, setPopupMessage] = useState("")
  
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
                  {!isBlocked && !isBlocking && (
                    <div>
                      <button
                        onClick={handleFollow}
                        className="follow-btn">
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={handleBlock}
                      className="block-btn">
                      {!isBlocking ? 'Block' : 'Unblock'}
                    </button>
                  </div>
                    {isFollowing && (<DropdownButton userId={profileUser.userId}/>)}
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
        <div className="profile-post-feed-container">
          {isOwnProfile && (
            <div className="post-card">

              <div className="post-input">
                <textarea
                  name="content"
                  className="post-text"
                  value={newPost.content}
                  type="text"
                  onChange={handlePostChange}
                  placeholder="What will you be hosting next?" />
              </div>

              {isAddImage && (
                <div>
                  <textarea
                    name="embeddedImage"
                    className="input-field"
                    value={newPost.embeddedImage}
                    type="text"
                    onChange={handlePostChange}
                    placeholder="Insert Image URL here" />
                </div>
              )}

              {newPost.embeddedImage && (
                <img
                  src={newPost.embeddedImage}
                  alt="Post Image"
                  className="event-embeddedImage"
                />
              )}

              <div className="post-buttons">
                <img
                  src={eventIcon}
                  alt="Event"
                  className="event-icon"
                  onClick={() => handleAddEventPopup()}
                />
                <img
                  src={imageIcon}
                  alt="Image"
                  className="image-icon"
                  onClick={() => handleAddImageBox(!isAddImage)}
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
              posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  poster={profileUser}
                  postEvent={post.eventId && eventsById[post.eventId]}
                  setPost={setPosts}
                  handleAddEventPopup={handleAddEventPopup}
                  handleEditPopup={handleEditPopup}
                  handlePostDelete={handlePostDelete}
                  isProfile={true}
                />
              ))
            )}
          </div>
        </div>
        {isEditPopupOpen && (
          <div className="edit-popup">
            <div className="edit-popup-content">
              <h2>Edit post</h2>
              <p>Content</p>
              <textarea
                name="content"
                value={currentPost?.content || ''} 
                className="textarea-field input-field"
                onChange={handlePostEditChange}  
                placeholder="Edit your post content"
                rows="5"
                cols="30"
              />
              <p>Image URL</p>
              <textarea
              name="embeddedImage"
                value={currentPost?.embeddedImage || ''}
                className="textarea-field input-field"
                onChange={handlePostEditChange}
                placeholder="Edit your post image URL"
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
                <div className="edit-event-content">
                  <h2>Edit event</h2>
                  <img 
                    src={removeIcon} 
                    onClick={() => handleEventDelete(newEvent._id)}   
                    alt="Remove" 
                    className="remove-event-icon " 
                  />
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
                      <input 
                        type="datetime-local" 
                        name="startTime" 
                        className="input-field" 
                        value={formatDateTimeLocal(newEvent.startTime)}
                        onChange={handleEventInputChange}
                      />
                      <span className="time-separator">-</span>
                      <input 
                        type="datetime-local" 
                        name="endTime" 
                        className="input-field" 
                        value={formatDateTimeLocal(newEvent.endTime)}
                        onChange={handleEventInputChange}
                      />



                </div>

              )}
              {(newEvent === null || newEvent === undefined) && (
                <div className="edit-event-content">
                  <button 
                    onClick={() => {
                      setEditPopupOpen(false);
                      handleAddEventPopup(currentPost)} 
                    }
                    className="edit-add-event-btn"> 
                    Add Event 
                  </button> 
                </div>
              )}
              
              {newEvent?.type === "NormalEvent" && (

                <div className="edit-event-content">
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

                <div className="edit-event-content">

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
                <div className="edit-event-content">
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
                    if (!newEvent.eventName) {
                      return;
                    }
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

      </div>
    </div>
  );
};

export default ProfileContent;


