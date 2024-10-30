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
  const { user, setUser } = useAuth();  
  const { showSharePopup, updateShareCount, updateLike } = usePopup();
  const [eventsById, setEventsById] = useState({});

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
          pfp: userInfo.imageURL,
          likedPosts: userInfo.likedPosts
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
    axios.get("http://localhost:3001/api/posts/feed")
    .then(response => {
      console.log("feed posts res:")
      console.log(response.data)
      updatePosts(response.data)
    })
    .catch (err => {
      console.log(err)
    })
  }, [])
 
  const updatePosts = async (posts) => {
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const response = await axios.get(`http://localhost:3001/api/user/${post.user}`);
          console.log("updatePosts res:")
          console.log(response)
          const { displayName, userName, imageURL } = response.data;
        for (const currentPost of posts) {
          if (currentPost.eventId) {
            if (!eventsById[currentPost.eventId]) {
              const event = (await axios.get(`http://localhost:3001/api/events/${currentPost.eventId}`)).data
              setEventsById(prevEvents => ({
                ...prevEvents,
                [currentPost.eventId]: event
              }));

            }
          }
        } 
          return {
            ...post,
            displayName,
            userName,
            imageURL,
          };
        } catch (error) {
          console.error(error);
          return post; 
        }
      })
    );

    setPosts(updatedPosts);
  };

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

  return (
    <div className="feed-container">

      <div className="feed-title">My Feed</div>
        <div className="feed-content">
          {posts.length === 0 ? (
              <div 
                className="empty-message">
                <h2> Nothing Here Yet </h2>
                <p> Come back later to see more posts! </p>
              </div>
          ) : (
            posts.map(post=>{
              const postEvent = post.eventId && eventsById[post.eventId]
              return (
                <div className="post" key={post._id}> 

                  <div className="post-header"> 

                  <img
                    src={post.imageURL || profilePic} 
                    alt="PostProfile" 
                    className="post-profilepic" 
                  />
                  
                  <div className="post-profile-info">
                    <div className="post-name">{post.displayName}</div>
                    <div className="post-username">@{post.userName}</div>
                  </div>      
                  
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
              )
            })
          )}
        </div>
    </div>
  );
};

export default Feed;


