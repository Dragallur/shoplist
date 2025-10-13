import pool from '$lib/database/connection.js';

// Get shop's items
export async function getItemsByShop(shopId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, quantity, unit, shop_id, created_by, created_at, updated_at
            FROM items
            WHERE shop_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await client.query(query, [shopId]);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching items by shop:', error);
        throw new Error('Failed to fetch items');
    } finally {
        client.release();
    }
}