import pool from '$lib/database/connection.js';

export async function createHousehold(name, userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const householdResult = await client.query(
            'INSERT INTO households (name, created_by) VALUES ($1, $2) RETURNING id, name, created_at, updated_at',
            [name, userId]
        );
        const household = householdResult.rows[0];

        await client.query(
            'INSERT INTO user_households (user_id, household_id) VALUES ($1, $2)',
            [userId, household.id]
        );

        await client.query('COMMIT');
        return household;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating household:', error);
        throw new Error('Failed to create household');
    } finally {
        client.release();
    }
}

export async function isUserInHousehold(userId, householdId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT 1 FROM user_households WHERE user_id = $1 AND household_id = $2',
            [userId, householdId]
        );
        return result.rows.length > 0;
    } finally {
        client.release();
    }
}

// Get user's households
export async function getHouseholdsByUser(userId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT h.id, h.name, h.created_at, h.updated_at
            FROM households h
            INNER JOIN user_households uh ON h.id = uh.household_id
            WHERE uh.user_id = $1
            ORDER BY h.name
        `;
        
        const result = await client.query(query, [userId]);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching user households:', error);
        throw new Error('Failed to fetch user households');
    } finally {
        client.release();
    }
}