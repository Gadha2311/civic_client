import"./navbar.css"
import {useAuth} from "../../context/AuthContext";
const Navbar = () => {
  const {userdata}=useAuth()
    return (
      <div className="navbar">
        <div className="profile">
          <img src={userdata.profilePicture} alt="Profile" className="profile-photo" />
          <span className="profile-name">{userdata.username}</span>
        </div>
      </div>
    );
  };
  export default Navbar