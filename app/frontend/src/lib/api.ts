import axios from 'axios';
import useStore from '../store/useStore';

const envUrl = import.meta.env?.VITE_BACKEND_URL;
const API_BASE = (envUrl && envUrl !== 'undefined') ? envUrl : 'http://localhost:4000';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true, // send cookies (refresh token)
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
    const token = useStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_BASE}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken = data.accessToken;
                useStore.getState().setAuth(useStore.getState().user!, newToken);
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                useStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_BASE };
