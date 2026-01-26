import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const apiCall = axios.create({
    baseURL: 'http://localhost:3000/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiCall.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const sessionData = localStorage.getItem('session');

        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (session && session.access_token) {
                    config.headers.Authorization = `Bearer ${session.access_token}`;
                }
            } catch (e) {
                console.error("Failed to parse session from localStorage", e);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiCall;