import axios from "axios";

const API_URL = import.meta.env.REACT_APP_API_URL;

const baseAPI = axios.create({
   baseURL: API_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

export default baseAPI;
