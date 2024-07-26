import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserFriends,
  faBell,
  faSearch,
  faEnvelope,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./sidebar.css";
import { faPersonRifle } from "@fortawesome/free-solid-svg-icons/faPersonRifle";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleProfileClick = () => {
    navigate("/profile"); 
  };
  const handleSearch=()=>{
    navigate("/search")
  }
  const handleHome=()=>{
    navigate("/home")
  }
  return (
    <div className="sidebar-container">
      <ul>
        <p>
          <li onClick={handleHome}>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
        </p>

        <p>
          <li>
            <FontAwesomeIcon icon={faUserFriends} /> Friends
          </li>
        </p>

        <p>
          <li>
            <FontAwesomeIcon icon={faBell} /> Notifications
          </li>
        </p>
        <p>
          <li onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />  Search
          </li>
        </p>
        <p>
          <li>
            <FontAwesomeIcon icon={faEnvelope} /> Messages
          </li>
        </p>
        <p>
          <li onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faPersonRifle} /> Profile
          </li>
        </p>

        <p onClick={handleLogout}>
          <li>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </li>
        </p>
      </ul>
    </div>
  );
};
export default Sidebar;
