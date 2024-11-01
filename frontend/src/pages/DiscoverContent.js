import "../styles/DiscoverContent.css";
import { useState, useEffect } from 'react';

import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'

import profilePic from './icons/profile.png'; 

import { useAuth } from '../AuthContext'; 


const DiscoverContent = () => { 
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { setUser } = useAuth();  
  const navigate = useNavigate();
  
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
          userId : userInfo.userId,
          pfp: userInfo.imageURL
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
    
  }, [])
  
  // TODO
  const handleQuery = async () => {
    if (!query) {
      showFailPopup("Search cannot be empty")
    } else if (query.length > 100) {
      showFailPopup("Search query cannot exceed 100 characters");
    } else {
      axios.post(`http://localhost:3001/api/user/search`, {"query": query})
      .then((response) => {
        if (response.data.length < 1) {
          showFailPopup("No Results")
        } else {
          setSearchResults(response.data)
        }
      })
      setSearchResults((await axios.post(`http://localhost:3001/api/user/search`, {"query": query})).data)
    }
  }
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  }
  
  const [popupMessage, setPopupMessage] = useState("")
  
  const showFailPopup = (message) => {
    var popup = document.getElementById("fail");
    setPopupMessage(message)
    popup.classList.add("show");
  
    setTimeout(function() {
        popup.classList.remove("show"); 
    }, 1000);
  }
  
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
        />
        <button 
          className="search-button"
          onClick={handleQuery}
        >
          🔍
        </button>
      </div>
      <div className="discover-content-content">
        {searchResults.length === 0 ? (
            <div 
              className="empty-message">
              <h2> Nothing Here Yet </h2>
              <p> Enter a search to get started with discovery</p>
            </div>

          ) : (
            searchResults.map(result=>(
              <div className="profile-card" onClick={()=>{navigate(`/profile/${result._id}`)}}> 
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


