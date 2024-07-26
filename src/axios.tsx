import axios, { AxiosInstance } from "axios";

const token = localStorage.getItem("accessToken");

const header = {
  Authorization: token ? "Bearer " + token : "Bearer ",
};

console.log(header, "okkkkkkkkkkk");

const Axios: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: header,
  withCredentials: false,
});

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

export default Axios;
