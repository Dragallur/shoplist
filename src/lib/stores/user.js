// User store for managing user-related state
import { writable } from 'svelte/store';
import { auth } from './auth.js';

export const userStore = writable({
    id: null,
    username: null,
    isAuthenticated: false,
    activeHousehold: null,
    activeShop: null
});

// Subscribe to auth store to update userStore on login/logout
auth.subscribe((authState) => {
    if (authState.isAuthenticated) {
        userStore.set({
            id: authState.user.id,
            username: authState.user.username,
            isAuthenticated: true,
            activeHousehold: null,
            activeShop: null
        });
    } else {
        userStore.set({
            id: null,
            username: null,
            isAuthenticated: false,
            activeHousehold: null,
            activeShop: null
        });
    }
});

// Set default active household and shop after login using getUserHouseholds
import { getUserHouseholds } from '$lib/database/queries.js';
import { getShopsByHousehold } from '$lib/database/queries.js';
auth.subscribe(async (authState) => {
    if (authState.isAuthenticated) {
        try {
            const households = await getUserHouseholds(authState.user.id);
            if (households.length > 0) {
                const firstHousehold = households[0];
                const shops = await getShopsByHousehold(firstHousehold.id);
                const firstShop = shops.length > 0 ? shops[0] : null;

                userStore.update(user => ({
                    ...user,
                    activeHousehold: firstHousehold,
                    activeShop: firstShop
                }));
            }
        } catch (error) {
            console.error('Error setting default household/shop:', error);
        }
    }
});
