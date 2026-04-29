import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { insertRecipeItem, reorderRecipeItems, replaceItemsForRecipe } from '$lib/database/queries/recipe_items.js';

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

// POST: add a new ingredient to a recipe
export async function POST({ request, cookies }) {
    try {
        const { recipeId, name } = await request.json();
        if (!name?.trim() || !recipeId) {
            return json({ error: 'name and recipeId are required' }, { status: 400 });
        }
        const createdBy = getUserId(cookies);
        const item = await insertRecipeItem(recipeId, name.trim(), createdBy);
        return json(item, { status: 201 });
    } catch (error) {
        console.error('Error creating recipe item:', error);
        return json({ error: 'Failed to create recipe item' }, { status: 500 });
    }
}

// PUT: replace all items for a recipe
export async function PUT({ request }) {
    try {
        const { recipeId, items } = await request.json();
        if (!recipeId || !Array.isArray(items)) {
            return json({ error: 'recipeId and items array are required' }, { status: 400 });
        }
        const newItems = await replaceItemsForRecipe(recipeId, items);
        return json(newItems);
    } catch (error) {
        console.error('Error replacing recipe items:', error);
        return json({ error: 'Failed to replace recipe items' }, { status: 500 });
    }
}

// PATCH: bulk reorder recipe items
export async function PATCH({ request }) {
    try {
        const { items } = await request.json();
        if (!Array.isArray(items)) {
            return json({ error: 'items array is required' }, { status: 400 });
        }
        await reorderRecipeItems(items);
        return json({ success: true });
    } catch (error) {
        console.error('Error reordering recipe items:', error);
        return json({ error: 'Failed to reorder recipe items' }, { status: 500 });
    }
}
