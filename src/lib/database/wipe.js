import pool from './connection.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function wipeDatabase() {
    try {
        const wipeSQL = readFileSync(join(__dirname, 'wipe_schema.sql'), 'utf8');
        
        // Split by semicolon and filter out empty statements
        const statements = wipeSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        // Execute each statement
        for (const statement of statements) {
            await pool.query(statement);
        }
        
        console.log('Database wiped successfully');
    } catch (error) {
        console.error('Database wipe error:', error);
        throw error;
    }
}

wipeDatabase()