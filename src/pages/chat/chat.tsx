import React, { useState, useEffect, useContext } from "react";
import "./chat.css";
import Axios from "../../axios";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { SocketContext } from "../../context/socket";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage } from '@fortawesome/free-solid-svg-icons';


const Chat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null); 

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await Axios.get("/auth/getUserChats");
        setChatUsers(response.data);
      } catch (error) {
        console.error("Error fetching chat users:", error);
      }
    };

    fetchChatUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      socket?.on("receiveMessage", (message) => {
        if (message.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
    }
  }, [selectedUser, chatId, socket]);

  const searchUsers = async () => {
    setSearchResults([]);

    try {
      const response = await Axios.get(`/auth/searchChat/${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserClick = async (user: any) => {
    try {
      const response = await Axios.post("/auth/createOrGetChat", {
        selectedUserId: user._id,
      });

      const chat = response.data;
      setChatId(chat._id);

      socket?.emit("JoinRoom", chat._id);

      const messagesResponse = await Axios.get(`/auth/chat/${chat._id}/messages`);
      setMessages(messagesResponse.data);

      setSelectedUser(user);
    } catch (error) {
      console.error("Error creating or fetching chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !imageFile) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("content", newMessage);
    formData.append(
      "senderId",
      JSON.parse(localStorage.getItem("user_data") ?? "")?.user?._id
    );

    if (imageFile) {
      formData.append("image", imageFile); 
    }

    try {
      const response = await Axios.post("/auth/sendMessage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const message = response.data;
      socket?.emit("sendMessage", message);

      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
      setImageFile(null); // Clear the selected image
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-app-container">
      <Navbar />
      <Sidebar />
      <div className="chat-sidebar">
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" onClick={searchUsers}>
            🔍
          </button>
        </div>
        <div className="chat-list">
          {chatUsers.map((user) => (
            <div
              key={user._id}
              className="chat-item"
              onClick={() => handleUserClick(user)}
            >
              <img
                src={user.profilePicture || "https://via.placeholder.com/50"}
                alt={user.username}
                className="chat-avatar"
              />
              <div className="chat-item-info">
                <div className="chat-item-header">
                  <span className="chat-item-name">{user.username}</span>
                </div>
              </div>
            </div>
          ))}
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="chat-item"
              onClick={() => handleUserClick(user)}
            >
              <img
                src={user.profilePicture || "https://via.placeholder.com/50"}
                alt={user.username}
                className="chat-avatar"
              />
              <div className="chat-item-info">
                <div className="chat-item-header">
                  <span className="chat-item-name">{user.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-header">
          <h2>{selectedUser ? selectedUser.username : "Select a user"}</h2>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-item ${
                msg.senderId ===
                JSON.parse(localStorage.getItem("user_data") ?? "")?.user?._id
                  ? "outgoing"
                  : "incoming"
              }`}
            >
              <div className="message-bubble">
                {msg.content && <p>{msg.content}</p>}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    
                    className="message-image"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
  <input
    type="text"
    placeholder="Your message"
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
  />
  <label htmlFor="image-upload" className="image-upload-icon">
    <FontAwesomeIcon icon={faImage} />
  </label>
  <input
    type="file"
    id="image-upload"
    accept="image/*"
    style={{ display: 'none' }}
    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
  />
  <button className="send-btn" onClick={handleSendMessage} disabled={isSending}>
    <FontAwesomeIcon icon={faPaperPlane} /> Send
  </button>
</div>

      </div>
    </div>
  );
};

export default Chat;
