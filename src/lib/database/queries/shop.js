import pool from '$lib/database/connection.js';

export async function getShopsByHousehold(householdId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, created_at, updated_at
            FROM shops
            WHERE household_id = $1
            ORDER BY name
        `;
        
        const result = await client.query(query, [householdId]);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching shops by household:', error);
        throw new Error('Failed to fetch shops');
    } finally {
        client.release();
    }
}
