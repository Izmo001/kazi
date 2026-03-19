import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to all requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request");
    } else {
      console.warn("⚠️ No token found");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;