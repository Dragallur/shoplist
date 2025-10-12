import pool from '$lib/database/connection.js';

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