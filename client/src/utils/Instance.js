import axios from "axios";
import Cookies from "js-cookie";

const api = "http://65.108.155.163:2805/api";

const Instance = axios.create({
  baseURL: api,
  timeout: 300000,
});

Instance.interceptors.request.use((config) => {
  const accessToken = Cookies.get("access_token");

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

Instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (
      refreshToken &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await Instance.post("/auth/refresh-token", {
          refreshToken: refreshToken || null,
        });

        const { accessToken, refreshToken: new_refresh_token } = response.data;

        Cookies.set("access_token", accessToken);
        Cookies.set("refresh_token", new_refresh_token);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return Instance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token xatoligi:", refreshError);

        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    } else {
      return Promise.reject(error);
    }
  }
);

export default Instance;
