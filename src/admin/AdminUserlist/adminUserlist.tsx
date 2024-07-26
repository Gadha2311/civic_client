import React, { useState, useEffect } from "react";
import Sidebar from "../../components/adminsidebar/adminSidebar";
import "./adminUserlist.css";
import Axios from "../../axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

interface User {
  
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  blocked: boolean;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchtext, setSearchtext] = useState<string>("");
  const [userlist, setUserlist] = useState<User[]>([]);
  const [showsort, setShowsort] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Axios.get("/auth/userlist");
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
        setUserlist(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Search user
  const handleSearch = () => {
    if (searchtext === "") {
      setUserlist(users);
    } else {
      const filteredData = users.filter((user) =>
        user.username.toLowerCase().includes(searchtext.toLowerCase())
      );
      setUserlist(filteredData);
    }
  };

  // Block and unblock user
  const BlockStatus = async (userId: string, currentStatus: boolean) => {
    Swal.fire({
      title: `Are you sure you want to ${
        currentStatus ? "unblock" : "block"
      } this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const endpoint = currentStatus
            ? `/auth/unblock/${userId}`
            : `/auth/block/${userId}`;
          await Axios.put(endpoint, { blocked: !currentStatus });

          setUserlist((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, blocked: !currentStatus } : user
            )
          );

          Swal.fire(
            `${currentStatus ? "Unblocked" : "Blocked"}!`,
            `The user has been ${currentStatus ? "unblocked" : "blocked"}.`,
            "success"
          );
        } catch (error) {
          console.error("Error updating user:", error);
          Swal.fire(
            "Error!",
            "There was an error updating the user. Please try again.",
            "error"
          );
        }
      }
    });
  };

  // Sorting
  const handlesort = () => {
    setShowsort(!showsort);
  };

  const sortAZ = () => {
    const sortedUsers = [...userlist].sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    setUserlist(sortedUsers);
    setShowsort(false);
  };

  const sortZA = () => {
    const sortedUsers = [...userlist].sort((a, b) =>
      b.username.localeCompare(a.username)
    );
    setUserlist(sortedUsers);
    setShowsort(false);
  };

  // Delete user
  const Deleteuser = async (userId: string) => {
    Swal.fire({
      title: `Are you sure you want to delete this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.delete(`/auth/deleteuser/${userId}`);
          setUserlist((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
          Swal.fire("Deleted", "The user has been deleted", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire(
            "Error!",
            "There was an error deleting the user. Please try again.",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="user-table">
      <h2>User List</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchtext}
          onChange={(e) => {
            setSearchtext(e.target.value);
          }}
        />
        <button className="usersearch-btn" onClick={handleSearch}>
          Search
        </button>
        <div className="sort-container">
          <button className="sort-btn" onClick={handlesort}>
            Sort
          </button>
          {showsort && (
            <div className="sortfrom">
              <button className="AZ-btn" onClick={sortAZ}>
                A-Z
              </button>
              <button className="AZ-btn" onClick={sortZA}>
                Z-A
              </button>
            </div>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Profile Picture</th>
            <th>Status</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userlist.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <img src={user.profilePicture} alt="Profile" width="50" />
              </td>
              <td>{user.blocked ? "Blocked" : "Unblocked"}</td>
              <td>
                <button
                  className={`block-btn ${user.blocked ? "unblock" : "block"}`}
                  onClick={() => BlockStatus(user._id, user.blocked)}
                >
                  {user.blocked ? "Unblock" : "Block"}
                </button>
              </td>
              <td>
                <button className="delete-btn">
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => Deleteuser(user._id)}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminUserlist: React.FC = () => {
  return (
    <>
      <Sidebar />
      <UserTable />
    </>
  );
};

export default AdminUserlist;
