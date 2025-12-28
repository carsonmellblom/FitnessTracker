const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5067/api';

// Auth API
export const authApi = {
    register: async (email, password, confirmPassword, userName) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Important for httpOnly cookies
            body: JSON.stringify({ email, password, confirmPassword, userName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Important for httpOnly cookies
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    logout: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        return response.json();
    },

    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 401) {
                return null; // Not authenticated
            }
            throw new Error('Failed to get current user');
        }
        return response.json();
    },

    refresh: async (accessToken, refreshToken) => {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ accessToken, refreshToken }),
        });
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        return response.json();
    },
};
