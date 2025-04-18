import axios from 'axios';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8000'; // Or your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Interceptor (Handles Auth Token and Content-Type) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Handle Content-Type for login
    if (config.url === '/token' && config.method === 'post') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        if (!(config.data instanceof URLSearchParams)) {
             const params = new URLSearchParams();
             for (const key in config.data) {
                 if (Object.prototype.hasOwnProperty.call(config.data, key)) {
                     params.append(key, config.data[key]);
                 }
             }
             config.data = params;
        }
    } else if (config.headers['Content-Type'] !== 'multipart/form-data') {
        // Default to JSON for other requests
         config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Authentication ---
export const loginUser = (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    // Backend returns { "access_token": ..., "token_type": "bearer" }
    return api.post('/token', formData);
};

export const signupUser = (username, email, password) => {
    return api.post('/users/', { username, email, password });
};

// --- User ---
export const getCurrentUser = () => {
    return api.get('/users/me');
};


// --- Channels ---
export const getAllChannels = (skip = 0, limit = 100) => {
    return api.get(`/channels/?skip=${skip}&limit=${limit}`);
};

export const getMyMemberships = () => {
    return api.get('/channels/my-memberships');
};

export const joinChannel = (channelId) => {
    return api.post(`/channels/${channelId}/join`);
};

export const leaveChannel = (channelId) => {
    return api.delete(`/channels/${channelId}/leave`);
};

// --- Messages ---
export const getMessagesForChannel = (channelId) => {
    return api.get(`/messages/channel/${channelId}`);
};

export const sendMessage = (channelId, content) => {
    return api.post(`/messages/channels/${channelId}/messages`, { content: content });
};

export default api;