import "../styles/Feed.css";
import { useState, useEffect, useRef } from 'react';

import { useNavigate } from "react-router-dom";
import axios from 'axios'

import { useAuth } from '../AuthContext'; 
import Post from '../components/Post';

const Feed = () => { 
  const [posts, setPosts] = useState([]);
  const { user, setUser } = useAuth();  
  const [eventsById, setEventsById] = useState({});
  const [profilesById, setProfilesById] = useState({})
  const observer = useRef(null); 

  const navigate = useNavigate();
  
  useEffect(() => {
    
    axios.get(process.env.REACT_APP_API_URL + "/api/user/validate") 
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
    axios.get(process.env.REACT_APP_API_URL + "/api/posts/feed")
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
          const postOwner = await axios.get(process.env.REACT_APP_API_URL + `/api/user/${post.user}`);
          console.log("updatePosts res:")
          console.log(postOwner)
          const { displayName, userName, imageURL } = postOwner.data;
          console.log(postOwner.data)
          setProfilesById(prevProfiles => ({
            ...prevProfiles,
            [post.user]: {
              displayName: displayName,
              userName: userName,
              pfp: imageURL,
            }
          }));
        for (const currentPost of posts) {
          if (currentPost.eventId) {
            if (!eventsById[currentPost.eventId]) {
              const event = (await axios.get(process.env.REACT_APP_API_URL + `/api/events/${currentPost.eventId}`)).data
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


const viewedPosts = new Set(); 

const trackViewCount = async (postId) => {
  if (viewedPosts.has(postId)) {
    console.log("returning")
    return;
  }
  try {
    await axios.post(process.env.REACT_APP_API_URL + "/api/posts/action", {
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const postId = entry.target.dataset.postId;
        trackViewCount(postId); 
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
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                poster={profilesById[post.user]}
                postEvent={post.eventId && eventsById[post.eventId]}
                setPost={setPosts}
              />
            ))
          )}
        </div>
    </div>
  );
};

export default Feed;


