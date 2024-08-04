import React, { useState, useEffect, MouseEvent, ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import Axios from "../../axios";
import "./allpost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import Carousel from "react-material-ui-carousel";

interface Post {
  _id: string;
  desc: string;
  img?: string[];
  createdAt: string;
  authorId: string;
  authorName: string;
  authorProfilePicture: string;
}

interface AuthContextType {
  token: string;
  userdata: {
    _id: string;
    name: string;
  };
}

interface AnchorEl {
  element: HTMLElement;
  postId: string;
}

const FollowedPosts: React.FC = () => {
  const { token, userdata } = useAuth() as AuthContextType;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<AnchorEl | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      try {
        const response = await Axios.get(
          `/auth/getTimelinePost/${userdata._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedPosts = response.data.sort(
          (a: Post, b: Post) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sortedPosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching followed posts:", error);
        setLoading(false);
      }
    };

    if (userdata) {
      fetchFollowedPosts();
    }
  }, [userdata, token]);

  const cld = new Cloudinary({
    cloud: {
      cloudName: "dt6kmfqpn",
    },
  });

  const publicId = (imageUrl: string) => {
    return imageUrl.split("/").pop()?.split(".")[0] || "";
  };

  const handleEdit = (post: Post) => {
    setEditPostId(post._id);
    setNewDesc(post.desc);
    setAnchorEl(null);
  };

  const handleSave = async (postId: string) => {
    setLoadingActions((prev) => ({ ...prev, [postId]: true }));
    const originalPosts = [...posts];
    setPosts(
      posts.map((post) =>
        post._id === postId ? { ...post, desc: newDesc } : post
      )
    );
    try {
      await Axios.put(
        `/auth/editpost/${postId}`,
        { desc: newDesc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditPostId(null);
    } catch (error) {
      console.error("Error editing post:", error);
      setPosts(originalPosts);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async () => {
    if (!postIdToDelete) return;
    setLoadingActions((prev) => ({ ...prev, [postIdToDelete]: true }));
    const originalPosts = [...posts];
    setPosts(posts.filter((post) => post._id !== postIdToDelete));
    try {
      await Axios.delete(`/auth/deletepost/${postIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteDialogOpen(false);
      setPostIdToDelete(null);
      toast.success(`Post deleted successfully.`);
    } catch (error) {
      console.error("Error deleting post:", error);
      setPosts(originalPosts);
      toast.error("Error deleting post.");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postIdToDelete]: false }));
    }
  };

  const handleClick = (event: MouseEvent<HTMLElement>, postId: string) => {
    setAnchorEl({ element: event.currentTarget, postId });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = (postId: string) => {
    setPostIdToDelete(postId);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostIdToDelete(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (posts.length === 0) {
    return <div className="no-posts">No posts yet.</div>;
  }

  return (
    <div className="followed-posts">
      {posts.map((post) => (
        <div key={post._id} className="post">
          <div className="post-header">
            <Avatar
              alt={post.authorName}
              src={post.authorProfilePicture}
              className="post-avatar"
            />
            <span className="post-author">{post.authorName}</span>
            {post.authorId === userdata._id && (
              <IconButton onClick={(e) => handleClick(e, post._id)}>
                <FontAwesomeIcon icon={faEllipsisV} />
              </IconButton>
            )}
            <Menu
              anchorEl={anchorEl?.element}
              open={Boolean(anchorEl) && anchorEl?.postId === post._id}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleEdit(post)}>
                <FontAwesomeIcon icon={faEdit} style={{ marginRight: "8px" }} />
                Edit
              </MenuItem>
              <MenuItem onClick={() => handleOpenDeleteDialog(post._id)}>
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ marginRight: "8px" }}
                />
                Delete
              </MenuItem>
            </Menu>
          </div>
          {editPostId === post._id ? (
            <div>
              <TextField
                value={newDesc}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewDesc(e.target.value)
                }
                fullWidth
              />
              <Button onClick={() => handleSave(post._id)}>Save</Button>
            </div>
          ) : (
            <>
              <div className="post-header-content">
                <p className="post-desc">{post.desc}</p>{" "}
              </div>
              {post.img && post.img.length > 0 && (
                <Carousel className="carousel-container">
                  {post.img.map((imgUrl, index) => (
                    <Paper key={index} className="carousel-paper">
                      <AdvancedImage
                        cldImg={cld.image(publicId(imgUrl))}
                        className="post-image"
                      />
                    </Paper>
                  ))}
                </Carousel>
              )}
            </>
          )}
          {/* <div className="post-meta">
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div> */}
        </div>
      ))}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default FollowedPosts;
