import pool from '$lib/database/connection.js';

export async function createShop(householdId, name, userId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO shops (name, household_id, created_by) VALUES ($1, $2, $3) RETURNING id, name, household_id, created_at, updated_at',
            [name, householdId, userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating shop:', error);
        throw new Error('Failed to create shop');
    } finally {
        client.release();
    }
}

export async function getShopById(shopId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id, name, household_id, created_at, updated_at FROM shops WHERE id = $1',
            [shopId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching shop by id:', error);
        throw new Error('Failed to fetch shop');
    } finally {
        client.release();
    }
}

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
