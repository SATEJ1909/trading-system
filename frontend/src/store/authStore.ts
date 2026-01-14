import { create } from 'zustand';
import api from '../api/axios';
import type { AuthState, LoginCredentials, SignupCredentials, AuthResponse, ProfileResponse } from '../types';

interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
    signup: (credentials: SignupCredentials) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
    // Initial state
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,

    // Set loading state
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // Login action
    login: async (credentials: LoginCredentials) => {
        try {
            set({ isLoading: true });
            const response = await api.post<AuthResponse>('/user/login', credentials);

            if (response.data.success && response.data.token && response.data.data) {
                const { token, data: user } = response.data;

                // Persist to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                return { success: true, message: response.data.message };
            }

            set({ isLoading: false });
            return { success: false, message: response.data.message || 'Login failed' };
        } catch (error: any) {
            set({ isLoading: false });
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        }
    },

    // Signup action
    signup: async (credentials: SignupCredentials) => {
        try {
            set({ isLoading: true });
            const response = await api.post<AuthResponse>('/user/signup', credentials);

            if (response.data.success && response.data.token && response.data.data) {
                const { token, data: user } = response.data;

                // Persist to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                return { success: true, message: response.data.message };
            }

            set({ isLoading: false });
            return { success: false, message: response.data.message || 'Signup failed' };
        } catch (error: any) {
            set({ isLoading: false });
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            return { success: false, message };
        }
    },

    // Logout action
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    // Check auth status on app load
    checkAuth: async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            set({ isAuthenticated: false, isLoading: false, user: null });
            return;
        }

        try {
            set({ isLoading: true });
            const response = await api.get<ProfileResponse>('/user/profile');

            if (response.data.success && response.data.data) {
                set({
                    user: response.data.data,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                // Invalid response, clear auth
                get().logout();
            }
        } catch (error) {
            // Token invalid or expired, clear auth
            get().logout();
        }
    },
}));
