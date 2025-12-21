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
                    //redirect: 'manual' // Important: handle redirect manually
                });

                // Check if server sent a redirect (successful login)
                if (response.type === 'opaqueredirect' || response.status === 0) {
                    // Redirect successful, reload page to navigate
                    if (browser) {
                        window.location.reload();
                    }
                    return { success: true };
                }

                if (response.redirected) {
                    if (browser) {
                        window.location.href = response.url;
                    }
                    return { success: true };
                }

                // If we get here, it's an error response (not a redirect)
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
        logout: async () => {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            
            set({
                user: null,
                isAuthenticated: false,
                loading: false
            });
            
            if (browser) {
                localStorage.removeItem('auth');
            }
        },
        init: async () => {
            if (browser) {
                // Check if user is authenticated by calling a verify endpoint
                try {
                    const response = await fetch('/api/auth/verify');
                    if (response.ok) {
                        const data = await response.json();
                        set({
                            isAuthenticated: true,
                            user: data.user,
                            loading: false
                        });
                    } else {
                        set({
                            isAuthenticated: false,
                            user: null,
                            loading: false
                        });
                    }
                } catch (error) {
                    set({
                        isAuthenticated: false,
                        user: null,
                        loading: false
                    });
                }
            }
        }
    }
}

export const auth = createAuthStore();