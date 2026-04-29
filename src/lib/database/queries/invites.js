import pool from '$lib/database/connection.js';

export async function createInvite(householdId, invitedBy, invitedUserId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `INSERT INTO household_invites (household_id, invited_by, invited_user_id)
             VALUES ($1, $2, $3)
             RETURNING id, household_id, invited_by, invited_user_id, status, created_at`,
            [householdId, invitedBy, invitedUserId]
        );
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') throw new Error('User already has a pending invite to this household');
        console.error('Error creating invite:', error);
        throw new Error('Failed to create invite');
    } finally {
        client.release();
    }
}

export async function getPendingInvitesForUser(userId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT hi.id, hi.household_id, hi.status, hi.created_at,
                    h.name AS household_name,
                    u.username AS invited_by_username
             FROM household_invites hi
             JOIN households h ON hi.household_id = h.id
             JOIN users u ON hi.invited_by = u.id
             WHERE hi.invited_user_id = $1 AND hi.status = 'pending'
             ORDER BY hi.created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching invites:', error);
        throw new Error('Failed to fetch invites');
    } finally {
        client.release();
    }
}

export async function getInviteById(inviteId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id, household_id, invited_by, invited_user_id, status FROM household_invites WHERE id = $1',
            [inviteId]
        );
        return result.rows[0] || null;
    } finally {
        client.release();
    }
}

export async function acceptInvite(inviteId, userId, householdId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'UPDATE household_invites SET status = $1 WHERE id = $2',
            ['accepted', inviteId]
        );
        await client.query(
            'INSERT INTO user_households (user_id, household_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, householdId]
        );
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error accepting invite:', error);
        throw new Error('Failed to accept invite');
    } finally {
        client.release();
    }
}

export async function rejectInvite(inviteId) {
    const client = await pool.connect();
    try {
        await client.query(
            'UPDATE household_invites SET status = $1 WHERE id = $2',
            ['rejected', inviteId]
        );
    } catch (error) {
        console.error('Error rejecting invite:', error);
        throw new Error('Failed to reject invite');
    } finally {
        client.release();
    }
}
