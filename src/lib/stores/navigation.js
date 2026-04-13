import { writable } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

function createNavStore() {
    const initial = { households: [], activeHousehold: null, shops: [], activeShop: null };
    const { subscribe, set, update } = writable(initial);

    let _state = initial;
    subscribe(s => { _state = s; });

    async function fetchHouseholds() {
        const res = await fetch('/api/households');
        if (!res.ok) throw new Error('Failed to load households');
        return res.json();
    }

    async function fetchShops(householdId) {
        const res = await fetch(`/api/households/${householdId}/shops`);
        if (!res.ok) throw new Error('Failed to load shops');
        return res.json();
    }

    return {
        subscribe,

        syncFromPage: async (shopId, householdId) => {
            if (!browser || !householdId) return;
            shopId = parseInt(shopId);
            householdId = parseInt(householdId);

            try {
                let households = _state.households;
                if (households.length === 0) {
                    households = await fetchHouseholds();
                }

                const activeHousehold =
                    households.find(h => h.id === householdId) ?? households[0] ?? null;

                let shops = _state.shops;
                if (!activeHousehold) {
                    shops = [];
                } else if (_state.activeHousehold?.id !== activeHousehold.id || shops.length === 0) {
                    shops = await fetchShops(activeHousehold.id);
                }

                const activeShop = shops.find(s => s.id === shopId) ?? null;
                set({ households, activeHousehold, shops, activeShop });
            } catch (error) {
                console.error('Nav sync error:', error);
            }
        },

        selectHousehold: async (household) => {
            update(s => ({ ...s, activeHousehold: household, shops: [], activeShop: null }));
            try {
                const shops = await fetchShops(household.id);
                update(s => ({ ...s, shops, activeShop: shops[0] ?? null }));
                if (shops[0]) goto(`/shop/${shops[0].id}`);
            } catch (error) {
                console.error('Error selecting household:', error);
            }
        },

        selectShop: (shop) => {
            update(s => ({ ...s, activeShop: shop }));
            goto(`/shop/${shop.id}`);
        },

        addHousehold: (household, defaultShop) => {
            update(s => ({
                ...s,
                households: [...s.households, household],
                activeHousehold: household,
                shops: [defaultShop],
                activeShop: defaultShop
            }));
            goto(`/shop/${defaultShop.id}`);
        },

        addShop: (shop) => {
            update(s => ({ ...s, shops: [...s.shops, shop], activeShop: shop }));
            goto(`/shop/${shop.id}`);
        },

        reset: () => set(initial)
    };
}

export const nav = createNavStore();
