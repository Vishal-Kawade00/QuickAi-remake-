import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// 1. Request Interceptor: Attach the token if the user has one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor: Catch global authentication errors
api.interceptors.response.use(
    (response) => {
        // If the API call succeeds, just return the response normally
        return response;
    },
    (error) => {
        // If the server responds with a 401 Unauthorized (missing or expired token)
        if (error.response && error.response.status === 401) {
            
            // Clear out the bad/expired token just to be safe
            localStorage.removeItem('token');
            
            // Fire the global toast notification
            toast.error("Please log in to continue.", { id: 'global-auth-toast' });
            
            // OPTIONAL: Automatically redirect them to the login page
            // If you are using React Router, window.location.href is a safe fallback outside of components
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login'; 
            }
        }
        
        // Always reject the promise so the specific component can also handle the error if it wants to
        return Promise.reject(error);
    }
);

export default api;