import React, { useState, useEffect } from 'react';
import Axios from '../../axios';
import { useAuth } from '../../context/AuthContext';
import { Avatar, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import './notification.css'; 
import Navbar from '../../components/navbar/navbar';
import Sidebar from '../../components/sidebar/sidebar';

const NotificationPage: React.FC = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log("Token:", token); // Add this line
        const response = await Axios.get('/auth/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };
    

    fetchNotifications();
  }, [token]);

  if (loading) {
    return <CircularProgress />;
  }

  if (notifications.length === 0) {
    return <div>No notifications.</div>;
  }

  return (
    <div className="notification-container">
       <Navbar />
       <Sidebar />
     
      <List className="notification-list">
        {notifications.map((notification) => (
          <ListItem key={notification._id} className="notification-item">
            <Avatar className="notification-avatar">
              {notification.content[0]}
            </Avatar>
            <ListItemText
              primary={notification.content}
              secondary={
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              }
              className="notification-content"
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default NotificationPage;
