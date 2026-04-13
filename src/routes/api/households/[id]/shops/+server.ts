import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getShopsByHousehold, createShop } from '$lib/database/queries/shop.js';
import { isUserInHousehold } from '$lib/database/queries/household.js';

function getUserId(cookies): number | null {
    try {
        const token = cookies.get('token');
        if (!token) return null;
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return decoded.userId;
    } catch {
        return null;
    }
}

// GET: list all shops in a household
export async function GET({ params, cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    const householdId = parseInt(params.id);
    if (isNaN(householdId)) return json({ error: 'Invalid household id' }, { status: 400 });

    try {
        if (!await isUserInHousehold(userId, householdId)) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }
        const shops = await getShopsByHousehold(householdId);
        return json(shops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        return json({ error: 'Failed to fetch shops' }, { status: 500 });
    }
}

// POST: create a new shop in a household
export async function POST({ params, request, cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    const householdId = parseInt(params.id);
    if (isNaN(householdId)) return json({ error: 'Invalid household id' }, { status: 400 });

    try {
        if (!await isUserInHousehold(userId, householdId)) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        const { name } = await request.json();
        if (!name?.trim()) {
            return json({ error: 'name is required' }, { status: 400 });
        }

        const shop = await createShop(householdId, name.trim(), userId);
        return json(shop, { status: 201 });
    } catch (error) {
        console.error('Error creating shop:', error);
        return json({ error: 'Failed to create shop' }, { status: 500 });
    }
}
