import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { useNavigate } from "react-router-dom";
import "./search.css";
import Axios from "../../axios";
import { useAuth } from "../../context/AuthContext";

const Search: React.FC = () => {
  const { config } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = () => {
    setLoading(true);
    setShowSuggestions(false);
    Axios.get(`/auth/search/${searchTerm}`, config)
      .then((res) => {
        console.log(`API response: ${res.data}`);
        setSearchResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
        setLoading(false);
      });
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        Axios.get(`/auth/search/${searchTerm}`, config)
          .then((res) => {
            console.log(`API response: ${res.data}`);
            setSearchResults(res.data);
          })
          .catch((err) => {
            console.error(`API error: ${err.message}`);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, config]);

  return (
    <div className="search">
      <Navbar />
      <Sidebar />
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleChange}
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : showSuggestions ? (
        <div className="search-results-container">
          {searchResults.length > 0
            ? searchResults.map((user) => (
                <div
                  key={user._id}
                  className="search-result-item"
                  onClick={() => handleUserClick(user._id)}
                >
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="search-result-avatar"
                  />
                  <div className="search-result-details">
                    <p className="search-result-username">{user.username}</p>
                  </div>
                </div>
              ))
            : searchTerm.length >= 3 && <p>No users found</p>}
        </div>
      ) : (
        <div className="search-results-full-page">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                className="search-result-item"
                onClick={() => handleUserClick(user._id)}
              >
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="search-result-avatar"
                />
                <div className="search-result-details">
                  <p className="search-result-username">{user.username}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
