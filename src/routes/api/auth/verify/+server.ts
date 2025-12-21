import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export async function GET({ cookies }) {
    try {
        const token = cookies.get('token');
        
        if (!token) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret'
        );

        return json({
            user: {
                id: decoded.userId,
                username: decoded.username
            }
        });
    } catch (error) {
        return json({ error: 'Invalid token' }, { status: 401 });
    }
}