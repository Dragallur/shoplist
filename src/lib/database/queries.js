import pool from '$lib/database/connection.js';

/**
 * Insert a new recipe with optional recipe items
 * @param {Object} recipeData - Recipe data object
 * @param {string} recipeData.name - Recipe name
 * @param {string} [recipeData.description] - Recipe description
 * @param {number} recipeData.shop_id - Shop ID reference
 * @param {number} recipeData.created_by - User ID who created the recipe
 * @param {Array} [recipeData.items] - Array of recipe items
 * @param {string} [recipeData.items[].unit] - Unit for the recipe item
 * @returns {Promise<Object>} Created recipe with items
 */
export async function insertRecipe(recipeData) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Inserting recipe with data:', recipeData); 
        console.log('ASDF', recipeData.name); 
        console.log('ASDF', recipeData.shop_id); 
        console.log('ASDF', recipeData.items); 
        const result = await client.query('SELECT current_database()');
        console.log('Connected to database:', result.rows[0].current_database);
        const name = recipeData.name;
        const shop_id = recipeData.shop_id;
        const created_by = recipeData.created_by;
        const items = recipeData.items || [];
        const description = recipeData.description || null;
        
        // Validate required fields
        if (!name || !shop_id || !created_by) {
            throw new Error('Name, shop_id, and created_by are required fields');
        }
        
        // Insert recipe
        const recipeQuery = `
            INSERT INTO recipes (name, description, shop_id, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const recipeResult = await client.query(recipeQuery, [
            name,
            description || null,
            shop_id,
            created_by
        ]);
        
        const recipe = recipeResult.rows[0];
        
        // Insert recipe items if provided
        const recipeItems = [];
        if (items && items.length > 0) {
            const itemQuery = `
                INSERT INTO recipe_items (recipe_id, unit)
                VALUES ($1, $2)
                RETURNING *
            `;
            
            for (const item of items) {
                const itemResult = await client.query(itemQuery, [
                    recipe.id,
                    item.unit || null
                ]);
                recipeItems.push(itemResult.rows[0]);
            }
        }
        
        await client.query('COMMIT');
        
        return {
            ...recipe,
            items: recipeItems
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
