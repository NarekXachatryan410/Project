import axios from "axios";

export const Axios = axios.create({
    baseURL: "http://localhost:4002",
    withCredentials: true,
})

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});