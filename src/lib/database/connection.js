import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'vojta',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'shoplist_test',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

export default pool;