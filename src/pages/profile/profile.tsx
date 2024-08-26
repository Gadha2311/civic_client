import React, { ChangeEvent, useEffect, useState  } from "react";
import "./profile.css";
import Sidebar from "../../components/sidebar/sidebar";
import Navbar from "../../components/navbar/navbar";
import { useAuth } from "../../context/AuthContext";
import { faEdit, faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Axios from "../../axios";
import EditProfileForm from "../../components/editprofile/editprofile";
import { useLocation, useNavigate } from "react-router-dom";
import Switch from "../../components/switch/switch";
import Swal from "sweetalert2";
import Post from "../post/post";

const ProfilePicture: React.FC = () => {
  const [img, setImg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const { userdata, token, setUserdata } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserdata = JSON.parse(localStorage.getItem("user_data") || "{}");
    console.log(storedUserdata);

    if (!storedUserdata.user || !storedUserdata.userToken) {
      navigate("/login", { replace: true });
      return;
    }

    setUserdata(storedUserdata.user);

    if (location.pathname === "/profile") {
      navigate(location.pathname, { replace: true });
    }

    setIsPrivate(storedUserdata.user.isPrivate);
  }, [location.pathname, navigate, setUserdata]);

  const handleEditClick = () => {
    setShowEditOptions(prev=>!prev);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        setImg(reader.result as string);
        setFile(selectedFile);
        handleUpload(selectedFile);
      };
    }
  };

  const handleSelectImage = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput.click();
  };

  const handleUpload = async (selectedFile: File) => {
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("img", selectedFile);

        const config = {
          headers: {
            "Content-Type": "multipart/form-data"}};

        const response = await Axios.post("/auth/uploadProfilePicture", formData, config);
        console.log("Upload response:", response);

        const updatedUser = {
          ...userdata,
          profilePicture: response.data.profilePicture,
        };

        setUserdata(updatedUser);
        localStorage.setItem("user_data", JSON.stringify({ userToken: token, user: updatedUser }));
        setUploading(false);
      } catch (err) {
        console.error("Upload error:", err);
        setUploading(false);
      }
    }
  };

  const handleSwitchChange = async (newIsPrivate: boolean) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to make your account ${newIsPrivate ? "private" : "public"}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
      });

      if (result.isConfirmed) {

        const response = await Axios.patch("/auth/updatestatus", { isPrivate: newIsPrivate });
        const updatedUser = response.data;
        setIsPrivate(updatedUser.isPrivate);
        setUserdata(updatedUser);
        localStorage.setItem("user_data", JSON.stringify({ userToken: token, user: updatedUser }));

        Swal.fire("Updated!", `Your account has been ${newIsPrivate ? "made private" : "made public"}.`, "success");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "There was an error updating your privacy status. Please try again later.", "error");
    }
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleShowFollowers = async () => {
    setShowFollowers(true);
    try {
      const response = await Axios.get(`/auth/getFollowers/${userdata._id}`);
      setFollowers(response.data);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowing(true);
    try {
      const response = await Axios.get(`/auth/getFollowing/${userdata._id}`);
      setFollowing(response.data);
    } catch (err) {
      console.error("Failed to fetch following:", err);
    }
  };

  const handleCloseModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  return (
    <div className="profile">
      <Navbar />
      <Sidebar />
      <div className="profile-container">
        <div className="profile-picture">
          <img src={img || userdata.profilePicture} alt="Profile Picture" />
          {uploading && <p>Uploading...</p>}
          <div className="dropdown">
            <button onClick={handleEditClick}>Edit</button>
            {showEditOptions && (
              <ul className="edit-options">
                <li onClick={handleSelectImage}>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    accept=".png,.jpeg,.jpg"
                    onChange={handleFileChange}
                  />
                  <FontAwesomeIcon icon={faCamera} /> Picture
                </li>
                <li onClick={openForm}>
                  <FontAwesomeIcon icon={faEdit} /> Details
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className="profile-info">
          <h1>{userdata.username}</h1>
          <p>{userdata.bio}</p>
        </div>

        <div className="profile-details">
          <div className="details">
            <div className="followers">
              <a href="#" onClick={handleShowFollowers}>
                <span className="count">{(userdata.followers || []).length}</span>
                <span className="label">FOLLOWERS</span>
              </a>
            </div>
            <div className="following">
              <a href="#" onClick={handleShowFollowing}>
                <span className="count">{(userdata.following || []).length}</span>
                <span className="label">FOLLOWING</span>
              </a>
            </div>
          </div>
          <div className="switch-container">
            <Switch isPrivate={isPrivate} onChange={handleSwitchChange} />
          </div>
        </div>
      </div>

      {isFormOpen && <EditProfileForm closeForm={closeForm} />}

      {(showFollowers || showFollowing) && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <h2>{showFollowers ? "Followers" : "Following"}</h2>
            <ul>
              {(showFollowers ? followers : following).map((user: any) => (
                <li key={user.id}>
                  <img src={user.profilePicture} alt={user.username} />
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="users-posts">
        <Post />
      </div>
    </div>
  );
};

export default ProfilePicture;
