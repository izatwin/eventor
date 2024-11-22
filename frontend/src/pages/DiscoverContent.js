import "../styles/DiscoverContent.css";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import profilePic from './icons/profile.png'; 
import { useAuth } from '../AuthContext'; 

import Post from '../components/Post';


const DiscoverContent = () => { 
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isPosts, setIsPosts] = useState(false);
  const [posts, setPosts] = useState([]);
  const [eventsById, setEventsById] = useState({});
  const [profilesById, setProfilesById] = useState({})
  const { setUser } = useAuth();  
  const navigate = useNavigate();
  const categories = ["Users", "Post Content", "Event Title", "Event Location"] 
  const [category, setCategory] = useState("")
  const dropdownRef = useRef(null);  // Add a ref for the dropdown

  const categoryMapping = {
    "Post Content": "postContent",
    "Event Title": "eventTitle",
    "Event Location": "eventLocation",
  };

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_URL + "/api/user/validate") 
    .then(response => {
      if (response.status === 200) {
        const userInfo = response.data['user-info'];
        setUser({    
          email: userInfo.email,
          displayName: userInfo.displayName,
          userName: userInfo.userName,
          userId : userInfo.userId,
          pfp: userInfo.imageURL
        });
      } else {
        navigate("/");
      }
    })
    .catch(err => {
      navigate("/");
      console.error(err);
    });
  }, [setUser, navigate]);
  
  const handleQuery = async () => {
    if (!query) {
      showFailPopup("Search cannot be empty");
    } else if (query.length > 100) {
      showFailPopup("Search query cannot exceed 100 characters");
    } else {
      console.log("query: " + query)
      try {
        let response;
        if (category === "Users") {
          response = await axios.post(process.env.REACT_APP_API_URL + `/api/user/search`, { "query": query });
        }
        else {
          response = await axios.post(process.env.REACT_APP_API_URL + `/api/posts/search`, { query: query, category: categoryMapping[category]});
          setPosts(response.data)
          // We have the posts, but we need supporting data.
          await processPosts(response.data)
        }
        if (response === undefined || response.data.length < 1) {
          showFailPopup("No Results");
        } else {
          
          if (category === "Users") { // Set IsPosts here instead of above category check so that the page does not disappear in case bool changes
            setIsPosts(false)
          } else {
            setIsPosts(true)
          }

          setSearchResults(response.data);
          console.log("SEARCH FOR POSTS")
          console.log(response.data)
        }
      } catch (error) {
        console.error(error);
      }
    }
    setQuery(""); 
    setCategory("");
  };

  const processPosts = async (posts) => {
    await Promise.all(
      posts.map(async (post) => {
        try {
          // Fetch post owner details
          const postOwner = await axios.get(process.env.REACT_APP_API_URL + `/api/user/${post.user}`);
          const { displayName, userName, imageURL } = postOwner.data;

          setProfilesById((prevProfiles) => ({
            ...prevProfiles,
            [post.user]: {
              displayName: displayName,
              userName: userName,
              pfp: imageURL,
            },
          }));

          // Fetch event details if the post has an eventId
          if (post.eventId) {
            if (!eventsById[post.eventId]) {
              const event = (await axios.get(process.env.REACT_APP_API_URL + `/api/events/${post.eventId}`)).data;

              setEventsById((prevEvents) => ({
                ...prevEvents,
                [post.eventId]: event,
              }));
            }
          }
        } catch (error) {
          console.error(`Error processing post with ID ${post.id}:`, error);
        }
      })
    );

    console.log("All posts have been processed.");    
  };
  

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleQuery();
    }
  };

  const handleQueryChange = (e) => {
    const userInput = e.target.value;
    setQuery(userInput);

    if (userInput) {
      const newSuggestions = categories.map(category => `${userInput} in ${category}`);
      setSuggestions(newSuggestions);  
    } else {
      setSuggestions([]); 
    }
  };
  
  const handleOptionSelect = (suggestion) => {
    console.log("option")
    const category = suggestion.split(" in ")[1]; 
    setCategory(category); 
  }
  
  // triggered after handleOptionSelect()
  useEffect(() => {
    if (category) {
      handleQuery(); 
    }
  }, [category]);

  const [popupMessage, setPopupMessage] = useState("");
  
  const showFailPopup = (message) => {
    var popup = document.getElementById("fail");
    setPopupMessage(message);
    popup.classList.add("show");
  
    setTimeout(() => {
      popup.classList.remove("show"); 
    }, 1000);
  };
  
  // Closes the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
  // Reopens the drowdown when clicking in the search bar
  const handleFocus = () => {
    if (query) {
      const newSuggestions = categories.map(category => `${query} in ${category}`);
      setSuggestions(newSuggestions);
    }
  };

  return (
    <div className="discover-content-container">
      <div className="discover-title">Discover</div>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="What are you looking for?"
          className="search-input"
          name="query"
          value={query}
          onChange={handleQueryChange}  
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
        />
        <button 
          className="search-button"
          onClick={handleQuery}
        >
          🔍
        </button>
      </div>

      {query && suggestions.length > 0 && ( 
        <div className="suggestions-dropdown" ref={dropdownRef} >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleOptionSelect(suggestion)}  
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <div className="discover-content-content">
        {searchResults.length === 0 ? (
          <div className="empty-message">
            <h2> Nothing Here Yet </h2>
            <p> Enter a search to get started with discovery</p>
          </div>
        ) : (
          isPosts ? (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                poster={profilesById[post.user]}
                postEvent={post.eventId && eventsById[post.eventId]}
                setPost={setPosts}
              />
            ))
          ) : (

            searchResults.map(result => (
              <div className="profile-card" onClick={() => navigate(`/profile/${result._id}`)} key={result._id}>
                <img src={result.imageURL || profilePic} alt="PostProfile" className="post-profilepic" />
                <div className="post-profile-info">
                  <div className="post-name">{result.displayName}</div>
                  <div className="post-username">{result.userName}</div>
                </div>
              </div>
            ))
          )
        )}

        <div className="postPopups">
          <div className="popup" id="success">{popupMessage}</div>
          <div className="popup" id="fail">{popupMessage}</div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverContent;



