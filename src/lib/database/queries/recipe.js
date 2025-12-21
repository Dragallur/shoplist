import pool from '$lib/database/connection.js';

// Get shop's recipes
export async function getRecipesByShop(shopId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, description, shop_id, created_by, created_at, updated_at, ordering
            FROM recipes
            WHERE shop_id = $1
            ORDER BY ordering
        `;
        
        const result = await client.query(query, [shopId]);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching recipes by shop:', error);
        throw new Error('Failed to fetch recipes');
    } finally {
        client.release();
    }
}