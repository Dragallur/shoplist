import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import pool from '$lib/database/connection.js';
import { isUserInHousehold } from '$lib/database/queries/household.js';
import { createInvite } from '$lib/database/queries/invites.js';

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

export async function POST({ params, request, cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    const householdId = parseInt(params.id);
    if (isNaN(householdId)) return json({ error: 'Invalid household id' }, { status: 400 });

    if (!await isUserInHousehold(userId, householdId)) {
        return json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username } = await request.json();
    if (!username?.trim()) return json({ error: 'username is required' }, { status: 400 });

    // Look up the invited user
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username.trim()]);
    if (result.rows.length === 0) return json({ error: 'User not found' }, { status: 404 });
    const invitedUserId = result.rows[0].id;

    if (invitedUserId === userId) return json({ error: 'You cannot invite yourself' }, { status: 400 });

    // Check if they are already a member
    if (await isUserInHousehold(invitedUserId, householdId)) {
        return json({ error: 'User is already a member of this household' }, { status: 409 });
    }

    try {
        const invite = await createInvite(householdId, userId, invitedUserId);
        return json(invite, { status: 201 });
    } catch (error: any) {
        if (error.message.includes('pending invite')) {
            return json({ error: 'User already has a pending invite to this household' }, { status: 409 });
        }
        console.error('Error creating invite:', error);
        return json({ error: 'Failed to create invite' }, { status: 500 });
    }
}
