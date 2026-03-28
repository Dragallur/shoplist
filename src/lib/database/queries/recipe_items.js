import pool from '$lib/database/connection.js';

// Replace all items for a recipe (delete + re-insert in order)
export async function replaceItemsForRecipe(recipeId, items) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM recipe_items WHERE recipe_id = $1', [recipeId]);
        const result = [];
        for (const [i, item] of items.entries()) {
            const r = await client.query(
                'INSERT INTO recipe_items (recipe_id, name, ordering) VALUES ($1, $2, $3) RETURNING id, name, ordering',
                [recipeId, item.name, i]
            );
            result.push(r.rows[0]);
        }
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error replacing recipe items:', error);
        throw new Error('Failed to replace recipe items');
    } finally {
        client.release();
    }
}

// Insert a new recipe item
export async function insertRecipeItem(recipeId, name, createdBy) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO recipe_items (recipe_id, name, created_by) VALUES ($1, $2, $3) RETURNING *',
            [recipeId, name, createdBy]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting recipe item:', error);
        throw new Error('Failed to insert recipe item');
    } finally {
        client.release();
    }
}

// Delete a recipe item by id
export async function deleteRecipeItem(id) {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM recipe_items WHERE id = $1', [id]);
    } catch (error) {
        console.error('Error deleting recipe item:', error);
        throw new Error('Failed to delete recipe item');
    } finally {
        client.release();
    }
}

// Bulk update ordering for a list of recipe items
export async function reorderRecipeItems(items) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            await client.query('UPDATE recipe_items SET ordering = $1 WHERE id = $2', [item.ordering, item.id]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reordering recipe items:', error);
        throw new Error('Failed to reorder recipe items');
    } finally {
        client.release();
    }
}

// Get recipe's items
export async function getRecipeItemsByRecipe(recipeId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, recipe_id, unit, created_by, created_at, updated_at, ordering, name, quantity
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