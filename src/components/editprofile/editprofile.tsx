import React, { ChangeEvent, useState } from "react";
import Axios from "../../axios";
import { useAuth } from "../../context/AuthContext";
import { EditProfileFormProps } from "../../Interfaces/profileInterface";
import "./editprofile.css";


const EditProfileForm: React.FC<EditProfileFormProps> = ({ closeForm }) => {
  const { userdata, token, setUserdata } = useAuth();
  const [editData, setEditData] = useState({
    name: userdata.username,
    bio: userdata.bio });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await Axios.put(
        "/auth/updateProfileDetails",
        { name: editData.name, bio: editData.bio } );

      const updatedUser = { ...userdata, ...response.data };
      setUserdata(updatedUser);
      localStorage.setItem(
        "user_data",
        JSON.stringify({ userToken: token, user: updatedUser })
      );
      closeForm();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="edit-profile-form">
      <h2>Edit Profile</h2>
      <form>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Bio:
          <input
            type="text"
            name="bio"
            value={editData.bio}
            onChange={handleInputChange}
          />
        </label>
        <button type="button" onClick={handleSaveChanges}>
          Save
        </button>
        <button type="button" onClick={closeForm}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
