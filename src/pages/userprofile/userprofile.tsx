import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../axios";
import { AxiosResponse } from "axios";
import "./userprofile.css";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { useAuth } from "../../context/AuthContext";

interface User {
  _id: string;
  username: string;
  bio: string;
  profilePicture: string;
  isPrivate: boolean;
  followers: string[];
  following: string[];
  blockedUsers: string[];
}

const UserProfile: React.FC = () => {
  const { config } = useAuth();
  const currentUserdata = JSON.parse(localStorage.getItem("user_data") || "{}");
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    Axios.get(`/auth/users/${userId}`)
      .then((res: AxiosResponse<User>) => {
        setUser(res.data);
        setLoading(false);
        setIsBlocked(res.data.blockedUsers.includes(currentUserdata.user._id));
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
        setLoading(false);
      });
  }, [userId]);

  const handleFollow = async () => {
    if (user) {
      const isFollowing = user.followers.includes(currentUserdata.user._id);
      try {
        if (isFollowing) {
          await Axios.put(`/auth/unfollow/${userId}`, {}, config);
          setUser({
            ...user,
            followers: user.followers.filter(
              (id) => id !== currentUserdata.user._id
            ),
          });
        } else {
          await Axios.put(`/auth/follow/${userId}`, {}, config);
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
      const response = await Axios.get(`/auth/getFollowers/${userId}`, {
        headers: { Authorization: `Bearer ${config.headers.Authorization}` },
      });
      setFollowers(response.data);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowing(true);
    try {
      const response = await Axios.get(`/auth/getFollowing/${userId}`, {
        headers: { Authorization: `Bearer ${config.headers.Authorization}` },
      });
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
    try {
      await Axios.put(`/auth/blockuser/${userId}`,{}, config);
      setIsBlocked(true);
    } catch (err: any) {
      console.error(`API error: ${err.message}`);
    }
  };

  const handleUnblock = async () => {
    try {
      await Axios.put(`/auth/unblock/${userId}`, {}, config);
      setIsBlocked(false);
    } catch (err: any) {
      console.error(`API error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile">
      <Navbar />
      <Sidebar />
      <div className="user-profile">
        <div className="profile-picture">
          <img src={user?.profilePicture} alt={user?.username} />
        </div>

        <div className="profile-info">
          <h1>{user?.username}</h1>
          <p>{user?.bio}</p>
        </div>

        <div className="details">
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

        {user?.isPrivate && (
          <p className="private-account">The account is private</p>
        )}
      </div>

      {(showFollowers || showFollowing) && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <h2>{showFollowers ? "Followers" : "Following"}</h2>
            <ul>
              {(showFollowers ? followers : following).map((user) => (
                <li key={user._id}>
                  <img src={user.profilePicture} alt={user.username} />
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
