/** @format */

import axios from "axios";

const Request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 30000,
});

const requestConfiguration = (config) => {
  /**
   * if user chooses to be remembered pull from local storage else
   * pull from session storage for consequent request
   */

  const token = localStorage.getItem("token");
  // don't append token for this routes
  if (token) {
    return {
      ...config,
      headers: {
        token: `Bearer ${token}`,
        credentials: "include",
        ...config.headers,
      },
    };
  }
  return config;
};

Request.interceptors.request.use(requestConfiguration, (error) => {
  return Promise.reject(error);
});

export { Request };
