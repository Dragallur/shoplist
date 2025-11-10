import pool from '$lib/database/connection.js';

// Get recipe's items
export async function getRecipeItemsByRecipe(recipeId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, recipe_id, unit, created_by, created_at, updated_at, ordering, name
            FROM recipe_items
            WHERE recipe_id = $1
            ORDER BY ordering
        `;
        
        const result = await client.query(query, [recipeId]);
        return result.rows;
        
    } catch (error) {
        console.error('Error fetching recipe items by recipe:', error);
        throw new Error('Failed to fetch recipe items');
    } finally {
        client.release();
    }
}