// src/lib/stores/auth.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createAuthStore() {
    const { subscribe, set, update } = writable({
        user: null,
        isAuthenticated: false,
        loading: true
    });

    return {
        subscribe,
        login: async (username, password) => {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    set({
                        user: result.user,
                        isAuthenticated: true,
                        loading: false
                    });
                    return { success: true };
                } else {
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: 'Network error' };
            }
        },
        register: async (username, password) => {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    return { success: true, message: 'Account created successfully' };
                } else {
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, error: 'Network error' };
            }
        },
        logout: () => {
            set({
                user: null,
                isAuthenticated: false,
                loading: false
            });
        },
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('auth');
                if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    set({
                    isAuthenticated: parsed.isAuthenticated,
                    user: parsed.user,
                    loading: false
                    });
                } catch (e) {
                    set({
                    isAuthenticated: false,
                    user: null,
                    loading: false
                    });
                }
                } else {
                set({
                    isAuthenticated: false,
                    user: null,
                    loading: false
                });
                }
            };
        }
    }
}

export const auth = createAuthStore();