import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getPendingInvitesForUser } from '$lib/database/queries/invites.js';

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

export async function GET({ cookies }) {
    const userId = getUserId(cookies);
    if (!userId) return json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const invites = await getPendingInvitesForUser(userId);
        return json(invites);
    } catch (error) {
        console.error('Error fetching invites:', error);
        return json({ error: 'Failed to fetch invites' }, { status: 500 });
    }
}
