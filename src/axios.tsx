import axios, { AxiosInstance } from "axios";


const token = JSON.parse(localStorage.getItem("user_data") as string);
console.log(token);

const header = {
  Authorization: token ? "Bearer " + token : "Bearer ",
};

console.log(header, "okkkkkkkkkkk");

const Axios: AxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
Axios.defaults.headers.common["Authorization"] = token?.userToken;

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
      console.error("Unauthorized, redirecting...");
    } else if (error.response?.status === 500) {
      console.error("Server error, please try again later.");
    }
    else if (error.response?.status === 404) {
      window.location.href = "/404"; 
      console.error("Page not found, redirecting...");
    }
    return Promise.reject(error);
  }
);

export default Axios;
