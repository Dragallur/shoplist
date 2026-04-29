import dotenv from 'dotenv';
dotenv.config();

import pool from './src/lib/database/connection.js';

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL successfully!');
        
        const result = await client.query('SELECT NOW()');
        console.log('Current time from database:', result.rows[0].now);
        
        client.release();
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } finally {
        await pool.end();
    }
}

testConnection();
