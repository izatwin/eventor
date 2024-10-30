import React, { createContext, useContext, useState } from 'react';
import "./styles/PopupContext.css";
import axios from 'axios'

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  
  const [isSharePopupOpen, setSharePopupOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const showSharePopup = (id) => {
    const url = `${window.location.origin}/post/${id}`; // Construct the post URL
    setCurrentUrl(url);
    setSharePopupOpen(true);
  };
 
  const hideSharePopup = () => {
    setSharePopupOpen(false);
    setCurrentUrl(''); 
  };
  
  // TODO 
  const updateShareCount= async (id) => {
    try {
      axios.post("http://localhost:3001/api/posts/action", {"postId": id, "actionType": "share"})
      return true; // successfull
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  // TODO 
  const updateLike= async (id, shouldLike) => {
    try {
      axios.post("http://localhost:3001/api/posts/toggle-like", {"postId": id, "like": shouldLike})
      return true; // successfull
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  return (
    <PopupContext.Provider value={{ showSharePopup, updateShareCount, updateLike}}>
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
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  return useContext(PopupContext);
};

