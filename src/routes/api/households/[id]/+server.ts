import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { isUserInHousehold, updateHouseholdName } from '$lib/database/queries/household.js';

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

export async function PATCH({ params, request, cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    const householdId = parseInt(params.id);
    if (isNaN(householdId)) return json({ error: 'Invalid household id' }, { status: 400 });

    if (!await isUserInHousehold(userId, householdId)) {
        return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name?.trim()) return json({ error: 'name is required' }, { status: 400 });

    try {
        const household = await updateHouseholdName(householdId, name.trim());
        return json(household);
    } catch (error) {
        console.error('Error renaming household:', error);
        return json({ error: 'Failed to rename household' }, { status: 500 });
    }
}
