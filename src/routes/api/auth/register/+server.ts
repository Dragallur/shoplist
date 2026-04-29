import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import pool from '$lib/database/connection.js';

export async function POST({ request }) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ error: 'Username and password are required' }, { status: 400 });
        }

        if (username.length < 3) {
            return json({ error: 'Username must be at least 3 characters long' }, { status: 400 });
        }

        if (password.length < 6) {
            return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (existingUser.rows.length > 0) {
            return json({ error: 'Username already exists' }, { status: 409 });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );

        // Create user's household
        const userId = result.rows[0].id;
        const householdResult = await pool.query(
            'INSERT INTO households (name, created_by) VALUES ($1, $2) RETURNING id',
            [`${username}'s Household`, userId]
        );

        const householdId = householdResult.rows[0].id;

        // Associate user with household
        await pool.query(
            'INSERT INTO user_households (user_id, household_id) VALUES ($1, $2)',
            [userId, householdId]
        );

        // Create default shop for the household
        await pool.query(
            'INSERT INTO shops (name, household_id, created_by) VALUES ($1, $2, $3)',
            ['Default Shop', householdId, userId]
        );

        const newUser = result.rows[0];

        return json({
            success: true,
            message: 'User created successfully',
            user: { id: newUser.id, username: newUser.username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}