import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../axios";
import "./userprofile.css";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Axios.get(`/auth/user/${userId}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
      });
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile">
      <Navbar />
      <Sidebar />
      <div className="user-profile">
        <div className="profile-picture">
          <img src={user.profilePicture} alt={user.username} />
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>{user.bio}</p>
          <div className="userdetails">
            <div className="follow">
              <a href="#">FOLLOW</a>
            </div>
            <div className="block">
              <a href="#">BLOCK</a>
            </div>
          </div>
          {user.isPrivate && <p className="private-account"><p>The account is private</p></p>}
        </div>
       
      </div>
    </div>
  );
};

export default UserProfile;
