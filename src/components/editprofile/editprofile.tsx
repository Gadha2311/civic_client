import React, { ChangeEvent, useState } from "react";
import Axios from "../../axios";
import { useAuth } from "../../context/AuthContext";
import { EditProfileFormProps } from "../../Interfaces/profileInterface";
import { Box, Button, TextField, Typography } from "@mui/material";

const EditProfileForm: React.FC<EditProfileFormProps> = ({ closeForm }) => {
  const { userdata, token, setUserdata } = useAuth();
  const [editData, setEditData] = useState({
    name: userdata.username,
    bio: userdata.bio,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await Axios.put("/auth/updateProfileDetails", {
        name: editData.name,
        bio: editData.bio,
      });

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
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: 3,
        boxShadow: 4,
        borderRadius: 2,
        zIndex: 1000,
        width: 400,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Edit Profile
      </Typography>
      <form>
        <TextField
          label="Name"
          name="name"
          value={editData.name}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          name="bio"
          value={editData.bio}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          fullWidth
          sx={{ marginBottom: 1 }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={closeForm}
          fullWidth
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
};

export default EditProfileForm;
