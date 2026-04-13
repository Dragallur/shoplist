import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getHouseholdsByUser, createHousehold } from '$lib/database/queries/household.js';
import { createShop } from '$lib/database/queries/shop.js';

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

// GET: list all households for the current user
export async function GET({ cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const households = await getHouseholdsByUser(userId);
        return json(households);
    } catch (error) {
        console.error('Error fetching households:', error);
        return json({ error: 'Failed to fetch households' }, { status: 500 });
    }
}

// POST: create a new household (with a default shop)
export async function POST({ request, cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const { name } = await request.json();
        if (!name?.trim()) {
            return json({ error: 'name is required' }, { status: 400 });
        }

        const household = await createHousehold(name.trim(), userId);
        const defaultShop = await createShop(household.id, 'Default Shop', userId);

        return json({ household, defaultShop }, { status: 201 });
    } catch (error) {
        console.error('Error creating household:', error);
        return json({ error: 'Failed to create household' }, { status: 500 });
    }
}
