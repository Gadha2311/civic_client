import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  faEllipsisV,
  faEdit,
  faTrash,
  faThumbsUp,
  faCommentDots,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Axios from "../../axios";
import { AxiosResponse } from "axios";
import "./userprofile.css";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { User } from "../../Interfaces/profileInterface";
import { Postinterface } from "../../Interfaces/postInterface";
import Carousel from "react-material-ui-carousel";

const UserProfile: React.FC = () => {
  const { config } = useAuth();
  const currentUserdata = JSON.parse(localStorage.getItem("user_data") || "{}");
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Postinterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRequestPending, SetIsRequestPending] = useState(false);
  const [newComment, setNewComment] = useState<string>("");
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Axios.get(`/auth/users/${userId}`)
      .then((res: AxiosResponse<{ user: User; posts: Postinterface[] }>) => {
        const { user, posts } = res.data;
        setUser(user);
        setPosts(posts);

        setLoading(false);

        if (user.blockedMe.includes(currentUserdata.user._id)) {
          setIsBlocked(true);
        }
        if (user.requests.includes(currentUserdata.user._id)) {
          SetIsRequestPending(true);
        } else {
          SetIsRequestPending(false);
        }
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
        setLoading(false);
      });
  }, [userId, currentUserdata.user._id]);

  const handleFollow = async () => {
    if (user) {
      const isFollowing = user.followers.includes(currentUserdata.user._id);
      try {
        if (isFollowing) {
          await Axios.put(`/auth/unfollow/${userId}`);
          setUser({
            ...user,
            followers: user.followers.filter((id) => id !== currentUserdata.user._id),
          });
        } else if (isRequestPending) {
          await Axios.put(`/auth/cancelRequest/${userId}`);
          SetIsRequestPending(false);
          Swal.fire("Request canceled.", "Your follow request has been canceled.", "info");
        } else if (user.isPrivate) {
          await Axios.put(`/auth/follow/${userId}`);
          SetIsRequestPending(true);
          Swal.fire("Follow request sent.", "info");
        } else {
          await Axios.put(`/auth/follow/${userId}`);
          setUser({
            ...user,
            followers: [...user.followers, currentUserdata.user._id],
          });
        }
      } catch (err: any) {
        console.error(`API error: ${err.message}`);
      }
    }
  };

  const handleShowFollowers = async () => {
    setShowFollowers(true);
    try {
      const response = await Axios.get(`/auth/getFollowers/${userId}`);
      setFollowers(response.data);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowing(true);
    try {
      const response = await Axios.get(`/auth/getFollowing/${userId}`);
      setFollowing(response.data);
    } catch (err) {
      console.error("Failed to fetch following:", err);
    }
  };

  const handleCloseModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  const handleBlock = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to block this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, block",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.put(`/auth/blockuser/${userId}`);
          setIsBlocked(true);
          Swal.fire("Blocked!", "The user has been blocked.", "success");
        } catch (err: any) {
          console.error(`API error: ${err.message}`);
          Swal.fire("Error!", "Failed to block the user.", "error");
        }
      }
    });
  };

  const handleUnblock = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to unblock this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, unblock",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.put(`/auth/unblockuser/${userId}`);
          setIsBlocked(false);
          Swal.fire("Unblocked!", "The user has been unblocked.", "success");
        } catch (err: any) {
          console.error(`API error: ${err.message}`);
          Swal.fire("Error!", "Failed to unblock the user.", "error");
        }
      }
    });
  };

  const handleLike = async (postId: string) => {
    setLoadingActions((prev) => ({ ...prev, [postId]: true }));
    try {
      await Axios.post(`/auth/likepost/${postId}`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(currentUserdata.user._id)
                  ? post.likes.filter((id) => id !== currentUserdata.user._id)
                  : [...post.likes, currentUserdata.user._id],
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async (event: FormEvent, postId: string) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await Axios.post(`/auth/commentpost/${postId}`, {
        text: newComment,
      });
      const addedComment = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  {
                    _id: addedComment._id,
                    text: newComment,
                    username: currentUserdata.user.username,
                    createdAt: addedComment.createdAt,
                  },
                ],
              }
            : post
        )
      );
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentsVisibility = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profilee">
      <Navbar />
      <Sidebar />
      <div className="user-profile">
        <div className="profile-userpicture">
          <img src={user?.profilePicture} alt={user?.username} />
        </div>

        <div className="profile-information">
          <h1>{user?.username}</h1>
          <p>{user?.bio}</p>
        </div>

        <div className="udetails">
          <div className="followers">
            <a href="#" onClick={handleShowFollowers}>
              <span className="count">{user?.followers.length}</span>
              <span className="label">FOLLOWERS</span>
            </a>
          </div>
          <div className="following">
            <a href="#" onClick={handleShowFollowing}>
              <span className="count">{user?.following.length}</span>
              <span className="label">FOLLOWING</span>
            </a>
          </div>
        </div>

        <div className="userdetails">
          <div className="follow">
            <a href="#" onClick={handleFollow}>
              {user?.followers.includes(currentUserdata.user._id)
                ? "UNFOLLOW"
                : isRequestPending
                ? "REQUESTED"
                : "FOLLOW"}
            </a>
          </div>
          <div className="block">
            {isBlocked ? (
              <a href="#" onClick={handleUnblock}>
                UNBLOCK
              </a>
            ) : (
              <a href="#" onClick={handleBlock}>
                BLOCK
              </a>
            )}
          </div>
        </div>

        {user?.isPrivate &&
          !user.followers.includes(currentUserdata.user._id) &&
          !user.following.includes(currentUserdata.user._id) && (
            <p className="private-account">The account is private</p>
          )}

        {posts.length > 0 && (
          <div className="userposts">
            {posts.map((post) => (
              <div key={post._id} className="userpost">
                <p>{post.desc}</p>
                <Carousel>
                  {post.img?.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post Image ${index + 1}`}
                    />
                  ))}
                </Carousel>

                <div className="post-actions">
                  <IconButton
                    onClick={() => handleLike(post._id)}
                    disabled={loadingActions[post._id]}
                  >
                    <FontAwesomeIcon
                      icon={faThumbsUp}
                      style={{
                        color: post.likes.includes(currentUserdata.user._id)
                          ? "blue"
                          : "gray",
                      }}
                    />
                    <span>{post.likes.length}</span>
                  </IconButton>
                  <IconButton
                    onClick={() => toggleCommentsVisibility(post._id)}
                  >
                    <FontAwesomeIcon icon={faCommentDots} />
                    <span>{post.comments?.length}</span>
                  </IconButton>
                </div>

                {showComments[post._id] && (
                  <div className="comments-section">
                    <form onSubmit={(e) => handleCommentSubmit(e, post._id)}>
                      <TextField
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Add a comment..."
                        fullWidth
                      />
                      <Button type="submit">Post</Button>
                    </form>
                    <ul className="comments-list">
                      {post.comments?.map((comment) => (
                        <li key={comment._id}>
                          <strong>{comment.username}:</strong> {comment.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
