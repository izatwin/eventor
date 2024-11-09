import "../styles/DiscoverContent.css";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import profilePic from './icons/profile.png'; 
import { useAuth } from '../AuthContext'; 

const DiscoverContent = () => { 
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);  
  const { setUser } = useAuth();  
  const navigate = useNavigate();
  const categories = ["Events", "Location", "People", "Posts"];  
  
  useEffect(() => {
    axios.get("http://localhost:3001/api/user/validate") 
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
    setQuery(""); 
    if (!query) {
      showFailPopup("Search cannot be empty");
    } else if (query.length > 100) {
      showFailPopup("Search query cannot exceed 100 characters");
    } else {
      try {
        const response = await axios.post(`http://localhost:3001/api/user/search`, { "query": query });
        if (response.data.length < 1) {
          showFailPopup("No Results");
        } else {
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
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
      const newSuggestions = categories.map(category => (
        <span>
          <strong>{userInput}</strong> in {category}
        </span>
      ));
      setSuggestions(newSuggestions);  
    } else {
      setSuggestions([]); 
    }
  };

  const [popupMessage, setPopupMessage] = useState("");
  
  const showFailPopup = (message) => {
    var popup = document.getElementById("fail");
    setPopupMessage(message);
    popup.classList.add("show");
  
    setTimeout(() => {
      popup.classList.remove("show"); 
    }, 1000);
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
        />
        <button 
          className="search-button"
          onClick={handleQuery}
        >
          🔍
        </button>
      </div>

      {query && suggestions.length > 0 && ( 
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleQuery()}  
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
          searchResults.map(result => (
            <div className="profile-card" onClick={() => navigate(`/profile/${result._id}`)} key={result._id}> 
              <img src={result.imageURL || profilePic} alt="PostProfile" className="post-profilepic" />
              <div className="post-profile-info">
                <div className="post-name">{result.displayName}</div>
                <div className="post-username">{result.userName}</div>
              </div>      
            </div>
          ))
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



