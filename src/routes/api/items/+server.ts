import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { insertItem, getMaxOrdering, reorderItems, replaceItemsForShop } from '$lib/database/queries/items.js';

function getUserId(cookies) {
    try {
        const token = cookies.get('token');
        if (!token) return null;
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return decoded.userId;
    } catch {
        return null;
    }
}

// POST: add a single item (e.g. from recipe to shopping list)
export async function POST({ request, cookies }) {
    try {
        const { name, shopId } = await request.json();
        if (!name?.trim() || !shopId) {
            return json({ error: 'name and shopId are required' }, { status: 400 });
        }
        const createdBy = getUserId(cookies);
        const maxOrdering = await getMaxOrdering(shopId);
        const item = await insertItem(shopId, createdBy, name.trim(), null, null, maxOrdering + 1);
        return json(item, { status: 201 });
    } catch (error) {
        console.error('Error creating item:', error);
        return json({ error: 'Failed to create item' }, { status: 500 });
    }
}

// PUT: replace all items for a shop
export async function PUT({ request }) {
    try {
        const { shopId, items } = await request.json();
        if (!shopId || !Array.isArray(items)) {
            return json({ error: 'shopId and items array are required' }, { status: 400 });
        }
        const newItems = await replaceItemsForShop(shopId, items);
        return json(newItems);
    } catch (error) {
        console.error('Error replacing items:', error);
        return json({ error: 'Failed to replace items' }, { status: 500 });
    }
}

// PATCH: bulk reorder items
export async function PATCH({ request }) {
    try {
        const { items } = await request.json();
        if (!Array.isArray(items)) {
            return json({ error: 'items array is required' }, { status: 400 });
        }
        await reorderItems(items);
        return json({ success: true });
    } catch (error) {
        console.error('Error reordering items:', error);
        return json({ error: 'Failed to reorder items' }, { status: 500 });
    }
}
