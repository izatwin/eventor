import viewIcon from '../pages/icons/view.png'
import likeIcon from '../pages/icons/like.png'
import likedIcon from '../pages/icons/liked.png'
import shareIcon from '../pages/icons/share.png'
import removeIcon from '../pages/icons/remove.png'
import editIcon from '../pages/icons/edit.png'
import expandIcon from '../pages/icons/expand.png'
import commentIcon from '../pages/icons/comment.png'
import eventIcon from '../pages/icons/event.png'

import profilePic from '../pages/icons/profile.png';

import { useAuth } from '../AuthContext';
import { usePopup } from '../PopupContext';

import { useNavigate, useParams } from "react-router-dom";




export default function Post({ post, poster, postEvent, setPost, handleAddEventPopup, handleEditPopup, handlePostDelete, isProfile }) {
    const navigate = useNavigate();

    const { showSharePopup, updateShareCount, updateLike } = usePopup();
    const { user, setUser } = useAuth();
    const isLiking = user?.likedPosts?.includes(post._id);

    const handleLike = async (id) => {
        var success = false
        var likedPosts = user.likedPosts || [];
        if (likedPosts.includes(id)) {
            success = await updateLike(id, false);
            if (success) {
                setPost(prevPosts =>
                    prevPosts.map(post =>
                        post._id === id ? { ...post, likes: post.likes - 1 } : post
                    )
                );

                likedPosts = likedPosts.filter(curId => curId !== id)

            }

        } else {
            success = await updateLike(id, true);
            if (success) {
                setPost(prevPosts =>
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

    const handleShare = async (id) => {
        const success = await updateShareCount(id);
        if (success) {
            setPost(prevPosts =>
                prevPosts.map(post =>
                    post._id === id ? { ...post, shares: post.shares + 1 } : post
                )
            );
        } else {
            console.error('Error updating share count');
        }
    };



    return (
        <div className="post" key={post._id} data-post-id={post._id}>
            <div className="post-header">

                <img src={poster.pfp ? poster.pfp : profilePic} alt="PostProfile" className="post-profilepic" />

                <div className="post-profile-info">
                    <div className="post-name">{poster.displayName}</div>
                    <div className="post-username">@{poster.userName}</div>
                </div>

                {isProfile && (
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
            {post.embeddedImage && (
                        <img
                            src={post.embeddedImage}
                            alt="Post"
                            className="post-embeddedImage"
                        />
                    )}
            {postEvent ? (
                  <div className="event">
                    <div className="event-header">
                      <img src={eventIcon} alt="Event Icon" className="event-icon" />
                      <h1>{postEvent.eventName}</h1>
                    </div>
                    <p className="event-description">{postEvent.eventDescription}</p>

                    {(postEvent.startTime || postEvent.endTime) && (
                      <div className="event-times">
                        {postEvent.startTime && (
                          <span>{new Date(postEvent.startTime).toLocaleString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        )}
                        {postEvent.startTime && postEvent.endTime && <span> - </span>}
                        {postEvent.endTime && (
                          <span>{new Date(postEvent.endTime).toLocaleString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        )}
                      </div>
                    )}

                    {postEvent.embeddedImage && (
                      <div className="event-image-container">
                        <img
                          src={postEvent.embeddedImage}
                          alt="Event Visual"
                          className="event-embeddedImage"
                        />
                      </div>
                    )}

                    {postEvent.type === "NormalEvent" && (
                      <p className="event-location">
                          {postEvent.location && (
                            <>
                              <strong>Location:</strong> {postEvent.location}
                            </>
                          )}
                      </p>
                    )}


                    {postEvent.type === "MusicReleaseEvent" && (
                      <div className="music-release-container">
                        <h2 className="event-release-title">
                          🎵 <b>{postEvent.releaseTitle}</b>
                        </h2>
                        <p className="event-release-artist">Artist: {postEvent.releaseArtist}</p>
                        <p className="event-release-type">Release Type: <span>[{postEvent.releaseType}]</span></p>

                        <div className="songs-list">
                          <h3>Tracklist:</h3>
                          {postEvent.songs.map((song, index) => (
                            <div className="event-song" key={index}>
                              {index + 1}. <b>{song.songTitle}</b> by {song.songArtist} 
                             {song.songDuration && (
                                <span className="destination-time"> ({song.songDuration} secs)</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="music-links">

                          {(postEvent.appleMusicLink || postEvent.spotifyLink) && (
                            <>
                              <i>Listen on: </i>
                              {postEvent.appleMusicLink && (
                                <a
                                  href={postEvent.appleMusicLink.startsWith("http") ? postEvent.appleMusicLink : `https://${postEvent.appleMusicLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Apple Music
                                </a>
                              )}
                              {postEvent.spotifyLink && (
                                <a
                                  href={postEvent.spotifyLink.startsWith("http") ? postEvent.spotifyLink : `https://${postEvent.spotifyLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Spotify
                                </a>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    )}

                    {postEvent.type === "TicketedEvent" && (
                      <div className="ticketed-event-container">
                        <h2 className="ticketed-event-title">🎟️ Ticketed Event</h2>
                        <div className="ticket-link">
                          <i>Get Tickets: </i>
                          <a
                            href={postEvent.getTicketsLink.startsWith("http") ? postEvent.getTicketsLink : `https://${postEvent.getTicketsLink}`}
                            className="ticket-button"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy Tickets
                          </a>
                        </div>
                        <div className="event-destinations">
                          <h3>Destinations:</h3>
                          {postEvent.destinations.map((destination, index) => (
                            <div className="event-destination" key={index}>
                              {index + 1}. {destination.location}
                              {destination.time && (
                                <span className="destination-time"> ({destination.time} secs)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                </div>
            ) : null}

            <div className="post-buttons buttons">

                <img src={viewIcon} alt="View" className="view-icon post-icon" />
                <div className="views-num num">{post.views}</div>
                <img onClick={() => { handleLike(post._id) }} src={isLiking ? likedIcon : likeIcon} alt="Like" className="like-icon post-icon" />
                <div className="likes-num num"> {post.likes} </div>
                <img onClick={() => { showSharePopup(post._id); handleShare(post._id) }} src={shareIcon} alt="Share" className="share-icon post-icon" />
                <div className="shares-num num"> {post.shares} </div>

                <div className="expand-comment">
                    <img src={commentIcon} alt="Comment" className="comment-icon post-icon" />
                    <div className="comment-num num">{post.comments.length}</div>
                    <img
                        src={expandIcon}
                        alt="Expand"
                        className="expand-icon post-icon"
                        onClick={() => { navigate(`/post/${post._id}`) }} />
                </div>
            </div>
        </div>
    );
}
