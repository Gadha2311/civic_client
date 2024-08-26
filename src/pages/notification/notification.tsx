import React, { useEffect, useState, useContext } from "react";
import Axios from "../../axios";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { Avatar, List, ListItem, ListItemText, CircularProgress, Button } from "@mui/material";
import { SocketContext } from "../../context/socket";
import "./notification.css";

interface Notification {
  _id: string;
  content: string;
  createdAt: string;
  postImage?: string;
  type?: string; 
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await Axios.get("/auth/notifications");
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          console.error("Unexpected response data format:", response.data);
          setError("Unexpected response data format.");
          setNotifications([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Error fetching notifications.");
        setNotifications([]);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket?.on("newLike", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket?.on("newComment", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
  }, [socket]);

  const handleApproveFollow = async (notificationId: string) => {
    try {
      const response = await Axios.post(`/auth/approve-follow/${notificationId}`);
      if (response.data === "User deleted the follow request") {
        alert("Request canceled by the user");
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      } else {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      }
    } catch (error) {
      console.error("Error approving follow request:", error);
    }
  };

  const handleDeclineFollow = async (notificationId: string) => {
    try {
      await Axios.post(`/auth/decline-follow/${notificationId}`);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="notification-container">
      <Navbar />
      <Sidebar />
      <div className="notification-content">
        {error && <p className="error-message">{error}</p>}
        {notifications.length === 0 ? (
          <div className="noNotification">No notifications.</div>
        ) : (
          <List className="notification-list">
            {notifications.map((notification) => (
              <ListItem key={notification._id} className="notification-item">
                <Avatar className="notification-avatar">
                  {notification.content[0]}
                </Avatar>
                <ListItemText
                  primary={notification.content}
                  secondary={
                    <div className="notification-content">
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {notification.postImage && (
                        <img
                          src={notification.postImage}
                          alt="Post"
                          className="notification-post-image"
                        />
                      )}
                      {notification.type === "follow" && (
                        <div className="follow-action-buttons">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleApproveFollow(notification._id)}
                            className="approve-button"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDeclineFollow(notification._id)}
                            className="decline-button"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
