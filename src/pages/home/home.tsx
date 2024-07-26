import "./home.css";
import Sidebar from "../../components/sidebar/sidebar";
import Navbar from "../../components/navbar/navbar";
// import Addpost from "../../components/Addpost/Addpost";
// import Post from "../posts/posts";
// import profile from "../profile/profile"

const Homepage = () => {
  return (
    <div className="Home-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        {/* <div className="addpost" */}
          {/* <Addpost />
          <Post /> */}
        </div>
      </div>
    // </div>
  );
};

const Home = () => {
  return (
    <div>
      <Homepage />
    </div>
  );
};

export default Home;
