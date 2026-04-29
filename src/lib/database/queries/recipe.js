import pool from '$lib/database/connection.js';

// Insert a new recipe
export async function insertRecipe(name, shopId, createdBy) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO recipes (name, shop_id, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, shopId, createdBy]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting recipe:', error);
        throw new Error('Failed to insert recipe');
    } finally {
        client.release();
    }
}

// Delete a recipe by id
export async function deleteRecipe(id) {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM recipes WHERE id = $1', [id]);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw new Error('Failed to delete recipe');
    } finally {
        client.release();
    }
}

// Bulk update ordering for a list of recipes
export async function reorderRecipes(recipes) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const recipe of recipes) {
            await client.query('UPDATE recipes SET ordering = $1 WHERE id = $2', [recipe.ordering, recipe.id]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering recipes:', error);
        throw new Error('Failed to reorder recipes');
    } finally {
        client.release();
    }
}

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