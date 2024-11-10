import viewIcon from '../pages/icons/view.png'
import likeIcon from '../pages/icons/like.png'
import likedIcon from '../pages/icons/liked.png'
import shareIcon from '../pages/icons/share.png'

import profilePic from '../pages/icons/profile.png';

import { useAuth } from '../AuthContext';
import { usePopup } from '../PopupContext';

const { showSharePopup, updateShareCount, updateLike } = usePopup();


export default function Post({ post, poster, postEvent, setPosts}) {
    const { user, setUser } = useAuth();
    const isLiking = user?.likedPosts?.includes(post._id);
    
    const handleLike = async (id) => {
        var success = false
        var likedPosts = user.likedPosts || [];
        if (likedPosts.includes(id)) {
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



    return (
        <div className="post" key={post._id}>
            <div className="post-header">

                <img src={poster.pfp ? poster.pfp : profilePic} alt="PostProfile" className="post-profilepic" />

                <div className="post-profile-info">
                    <div className="post-name">{poster.displayName}</div>
                    <div className="post-username">@{poster.userName}</div>
                </div>

            </div>

            <div className="post-content">
                {post.content}
            </div>
            {postEvent ? (
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
                            <br />
                            <i> Apple Music: </i> <a href={postEvent.appleMusicLink} style={{ color: 'black' }}> {postEvent.appleMusicLink} </a>  <br />
                            <i> Spotify: </i> <a href={postEvent.spotifyLink} style={{ color: 'black' }} > {postEvent.spotifyLink} </a> <br /> <br />


                        </div>
                    )}
                    {postEvent.type === "TicketedEvent" && (
                        <div>
                            <i> Get Tickets: </i> <a href={postEvent.getTicketsLink} style={{ color: 'black' }}> {postEvent.getTicketsLink} </a>  <br /><br />
                            {postEvent.destinations.map((destination, index) => (
                                <div className="event-destination">
                                    {index + 1}. {destination.location} ({destination.time})
                                </div>
                            ))}
                            <br />
                        </div>
                    )}

                </div>
            ) : null}

            <div className="post-buttons">

                <img src={viewIcon} alt="View" className="view-icon post-icon" />
                <div className="views-num num">{post.views}</div>
                <img onClick={() => { handleLike(post._id) }} src={isLiking ? likedIcon : likeIcon} alt="Like" className="like-icon post-icon" />
                <div className="likes-num num"> {post.likes} </div>
                <img onClick={() => { showSharePopup(post._id); handleShare(post._id) }} src={shareIcon} alt="Share" className="share-icon post-icon" />
                <div className="shares-num num"> {post.shares} </div>
            </div>
        </div>
    );
}