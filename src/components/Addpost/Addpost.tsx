import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Addpost.css";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useQueryClient } from "@tanstack/react-query";
import Axios from "../../axios";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import EmojiPicker from "emoji-picker-react";
import CloseIcon from "@mui/icons-material/Close";
import { AddPostProps } from "../../Interfaces/postInterface";



const AddPost: React.FC<AddPostProps> = ({ onPostAdded }) => {
  const [desc, setDesc] = useState("");
  const [imgs, setImgs] = useState<Array<string | ArrayBuffer>>([]);
  const [uploading, setUploading] = useState(false);
  const { userdata, token } = useAuth();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userdata) {
      console.log("User not authenticated");
    }
  }, [userdata]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDesc(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      const fileReaders = fileArray.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise<string | ArrayBuffer>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string | ArrayBuffer);
          };
        });
      });

      Promise.all(fileReaders).then((newImgs) => {
        setImgs((prevImgs) => [...prevImgs, ...newImgs]);
        setFiles((prevFiles) => [...prevFiles, ...fileArray]);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImgs((prevImgs) => prevImgs.filter((_, i) => i !== index));
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpload();
    }
  };

  const handleUpload = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (desc?.trim().length !== 0 && desc != null) {
      setUploading(true);
      e?.preventDefault();
      try {
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization: `Bearer ${token}`,
          },
        };

        const formData = new FormData();
        formData.append("desc", desc);
        files.forEach((file) => {
          formData.append("img", file);
        });
        await Axios.post("/auth/createPost", formData, config);

        queryClient.invalidateQueries({ queryKey: ["posts"] });
        setDesc("");
        setImgs([]);
        setFiles([]);
        onPostAdded(); 
        setUploading(false);
      } catch (err) {
        console.error(err);
        setUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    handleUpload();
  };

  return (
    <div className="share">
      <div className="homecontainer">
        <div className="top">
          <div className="left">
            <input
              type="text"
              placeholder={`What's on your mind ${userdata?.username}?`}
              onChange={handleChange}
              value={desc}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="right">
            {imgs.map((img, index) => (
              <div key={index} className="img-container">
                <CloseIcon
                  className="remove-icon"
                  onClick={() => handleRemoveImage(index)}
                />
                <img className="file" alt="" src={img as string} />
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              name="img"
              id="file"
              style={{ display: "none" }}
              accept=".png, .jpeg, .jpg"
              onChange={handleFileChange}
              multiple
            />
            <label htmlFor="file">
              <div className="item">
                <AddAPhotoIcon style={{ color: "grey" }} />
                <span className="text-3xl font-bold ">Add Images</span>
              </div>
            </label>
            <div className="item">
              <InsertEmoticonIcon onClick={() => setEmojiOpen(!emojiOpen)} />
              <span
                style={{ color: "orange", fontSize: "12px", fontWeight: 600 }}
              >
                Feeling/Activity
              </span>
              {emojiOpen && (
                <div className="emoji-picker">
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      setDesc((prev) => (prev ? prev + e.emoji : e.emoji));
                      setEmojiOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="right">
            <button onClick={handleUploadClick}>
              {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
