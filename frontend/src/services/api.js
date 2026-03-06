import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Log API URL at startup (helps debug environment mismatches)
if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API URL: ${API_URL}`);
}

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 second timeout — prevents hanging requests
});

// ─── Request interceptor: attach auth token ───
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: handle errors globally ───
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network error (server down, wrong port, CORS blocked)
        if (!error.response) {
            console.error('❌ Network error - API might be unreachable:', API_URL);
            console.error('   Check if backend is running on the correct port.');
            error.message = 'Cannot connect to server. Please check if the backend is running.';
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // Token expired or invalid → force logout
        if (status === 401 && data?.code === 'TOKEN_EXPIRED') {
            console.warn('⚠️ Token expired, logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Token invalid → force logout
        if (status === 401 && data?.code === 'TOKEN_INVALID') {
            console.warn('⚠️ Invalid token, logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// NOTE: DB paths are stored as `/uploads/avatars/x.jpg` etc.
// So UPLOAD_URL must be the server root (no trailing /uploads) to avoid double-path.
// Usage: `${UPLOAD_URL}${path}` e.g. `http://localhost:5002/uploads/avatars/x.jpg`
export const UPLOAD_URL = API_URL.replace('/api', '');
export default api;
