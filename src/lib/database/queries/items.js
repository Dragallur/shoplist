import pool from '$lib/database/connection.js';

// Get shop's items
export async function getItemsByShop(shopId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, quantity, unit, shop_id, created_by, created_at, updated_at, ordering
            FROM items
            WHERE shop_id = $1
            ORDER BY ordering
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

// Insert a new item into a shop
export async function insertItem(shopId, createdBy, name, quantity, unit, ordering) {
    const client = await pool.connect();
    console.log('Inserting item:', { shopId, createdBy, name, quantity, unit, ordering }); 
    try {
        const query = `
            INSERT INTO items (shop_id, created_by, name, quantity, unit, ordering)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, quantity, unit, shop_id, created_by, created_at, updated_at
        `;
        
        const result = await client.query(query, [shopId, createdBy, name, quantity, unit, ordering]);
        return result.rows[0];
        
    } catch (error) {
        console.error('Error inserting new item:', error);
        throw new Error('Failed to insert item');
    } finally {
        client.release();
    }
}

// Get the maximum ordering value for a shop
export async function getMaxOrdering(shopId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT COALESCE(MAX(ordering), 0) as max_ordering
            FROM items
            WHERE shop_id = $1
        `;
        
        const result = await client.query(query, [shopId]);
        return result.rows[0].max_ordering;
        
    } catch (error) {
        console.error('Error getting max ordering:', error);
        return 0;
    } finally {
        client.release();
    }
}