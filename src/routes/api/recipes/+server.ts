import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { insertRecipe, reorderRecipes } from '$lib/database/queries/recipe.js';

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

// POST: create a new recipe
export async function POST({ request, cookies }) {
    try {
        const { name, shopId } = await request.json();
        if (!name?.trim() || !shopId) {
            return json({ error: 'name and shopId are required' }, { status: 400 });
        }
        const createdBy = getUserId(cookies);
        const recipe = await insertRecipe(name.trim(), shopId, createdBy);
        return json(recipe, { status: 201 });
    } catch (error) {
        console.error('Error creating recipe:', error);
        return json({ error: 'Failed to create recipe' }, { status: 500 });
    }
}

// PATCH: bulk reorder recipes
export async function PATCH({ request }) {
    try {
        const { recipes } = await request.json();
        if (!Array.isArray(recipes)) {
            return json({ error: 'recipes array is required' }, { status: 400 });
        }
        await reorderRecipes(recipes);
        return json({ success: true });
    } catch (error) {
        console.error('Error reordering recipes:', error);
        return json({ error: 'Failed to reorder recipes' }, { status: 500 });
    }
}
