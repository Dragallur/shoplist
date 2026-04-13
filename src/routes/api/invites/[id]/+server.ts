import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { getInviteById, acceptInvite, rejectInvite } from '$lib/database/queries/invites.js';

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

    const inviteId = parseInt(params.id);
    if (isNaN(inviteId)) return json({ error: 'Invalid invite id' }, { status: 400 });

    const { status } = await request.json();
    if (status !== 'accepted' && status !== 'rejected') {
        return json({ error: 'status must be accepted or rejected' }, { status: 400 });
    }

    const invite = await getInviteById(inviteId);
    if (!invite) return json({ error: 'Invite not found' }, { status: 404 });
    if (invite.invited_user_id !== userId) return json({ error: 'Forbidden' }, { status: 403 });
    if (invite.status !== 'pending') return json({ error: 'Invite is no longer pending' }, { status: 409 });

    try {
        if (status === 'accepted') {
            await acceptInvite(inviteId, userId, invite.household_id);
        } else {
            await rejectInvite(inviteId);
        }
        return json({ success: true });
    } catch (error) {
        console.error('Error responding to invite:', error);
        return json({ error: 'Failed to update invite' }, { status: 500 });
    }
}
