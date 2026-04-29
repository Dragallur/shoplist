import { json, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '$lib/database/connection.js';
import { getHouseholdsByUser } from '$lib/database/queries/household.js';
import { getShopsByHousehold } from '$lib/database/queries/shop.js';

export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Get user from database
        const result = await pool.query(
            'SELECT id, username, password_hash FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie using SvelteKit's cookies helper
        cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        // Fetch user's households
        const households = await getHouseholdsByUser(user.id);
        
        if (households.length === 0) {
            return json({ error: 'No households found for user' }, { status: 404 });
        }

        const defaultHousehold = households[0];

        // Fetch shops for the default household
        const shops = await getShopsByHousehold(defaultHousehold.id);
        
        if (shops.length === 0) {
            return json({ error: 'No shops found for household' }, { status: 404 });
        }

        const defaultShop = shops[0];

        console.log('Login successful, redirecting to default shop:', defaultShop.id);
        throw redirect(303, `/shop/${defaultShop.id}`);

    } catch (error) {
        // Re-throw redirect errors
        if (error?.status >= 300 && error?.status < 400) {
            throw error;
        }
        
        console.error('Login error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}