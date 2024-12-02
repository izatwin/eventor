import React, { createContext, useContext, useState } from 'react';
import "./styles/PopupContext.css";
import axios from 'axios'

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  
  const [isSharePopupOpen, setSharePopupOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showSharePopup = (id) => {
    const url = `${window.location.origin}/post/${id}`; // Construct the post URL
    setCurrentUrl(url);
    setSharePopupOpen(true);
  };
 
  const hideSharePopup = () => {
    setSharePopupOpen(false);
    setCurrentUrl(''); 
  };
  
  const updateShareCount= async (id) => {
    try {
      axios.post(process.env.REACT_APP_API_URL + "/api/posts/action", {"postId": id, "actionType": "share"})
      return true; // successfull
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  const updateLike= async (id, shouldLike) => {
    try {
      axios.post(process.env.REACT_APP_API_URL + "/api/posts/toggle-like", {"postId": id, "like": shouldLike})
      return true; // successfull
    } catch (err) {
      console.log(err)
      return false;
    }
  }


  const showOffensivePopup = (message) => {
    console.log("IN POP")
    console.log(message)
    var popup = document.getElementById("offensive");
    setPopupMessage(message)
    popup.classList.add("show");
    console.log(message)

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
  
  const showSuccessPopup = (message) => {
    var popup = document.getElementById("success");
    setPopupMessage(message)
    popup.classList.add("show");

    setTimeout(function() {
        popup.classList.remove("show");
    }, 1000);
  }

  return (
    <PopupContext.Provider value={{ showSharePopup, updateShareCount, updateLike, showOffensivePopup, showSuccessPopup, showFailPopup}}>
      {children}
      {isSharePopupOpen && (
        <div className="share-popup-container">
          <div className="share-popup-content">
            <div className="share-link">
              Link to post: <br/><br/>
              <a href={currentUrl}> {currentUrl} </a>
            </div>
            <button 
              onClick={hideSharePopup} 
              className="close-button">
              x
            </button>
          </div>
        </div>
      )}
      <div className="offensive-popup" id="offensive">{popupMessage}</div>
      <div className="postPopups">
        <div className="popup" id="success">{popupMessage}</div>
        <div className="popup" id="fail">{popupMessage}</div>
      </div>
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  return useContext(PopupContext);
};

