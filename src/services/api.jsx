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

    // Handle Content-Type for login explicitly
    if (config.url === '/token' && config.method === 'post') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        // Ensure data is URLSearchParams if Content-Type is form-urlencoded
        if (!(config.data instanceof URLSearchParams)) {
             const params = new URLSearchParams();
             for (const key in config.data) {
                 if (Object.prototype.hasOwnProperty.call(config.data, key)) {
                     params.append(key, config.data[key]);
                 }
             }
             config.data = params;
        }
    // Let Axios handle Content-Type for FormData (multipart/form-data)
    // Otherwise, default to JSON
    } else if (!(config.data instanceof FormData) && config.headers['Content-Type'] !== 'multipart/form-data') {
         config.headers['Content-Type'] = 'application/json';
    }
    // Note: If config.data is FormData, Axios will automatically set
    // Content-Type to multipart/form-data with the correct boundary.

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Authentication ---
export const loginUser = (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
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

// --- Text Messages ---
export const sendTextMessage = (channelId, content) => {
    // Renamed from sendMessage for clarity
    return api.post(`/messages/channels/${channelId}/messages`, { content: content });
};

// --- File Messages ---
/**
 * Uploads a file to the specified channel.
 * @param {string|number} channelId - The ID of the channel.
 * @param {File} file - The file object to upload.
 * @returns {Promise<AxiosResponse<any>>} - Promise resolving with the created message object.
 */
export const uploadFileMessage = (channelId, file) => {
    const formData = new FormData();
    formData.append('file', file); // The backend expects the file under the key 'file'

    // Axios automatically sets Content-Type to multipart/form-data
    return api.post(`/messages/channels/${channelId}/files`, formData);
};

/**
 * Gets a temporary, pre-signed access URL for a file message.
 * @param {string|number} messageId - The ID of the file message.
 * @returns {Promise<AxiosResponse<any>>} - Promise resolving with { url: "..." }.
 */
export const getFileAccessUrl = (messageId) => {
    return api.get(`/messages/${messageId}/access-url`);
};


export default api;