import { json, error } from '@sveltejs/kit';
import { getRecipesByShop } from '$lib/database/queries/recipe.js';
import { insertRecipe } from '$lib/database/queries.js';

export async function GET({ url, locals }) {
    try {
        // Assuming you have user authentication middleware that sets locals.user
        const userId = 0;
        const householdId = 0;
        const shopId = 0;

        if (!userId) {
            throw error(401, 'Unauthorized');
        }

        if (!householdId || !shopId) {
            throw error(400, 'household_id and shop_id are required');
        }

        const recipes = await getRecipesByShop(
            parseInt(shopId)
        );

        return json(recipes);
        
    } catch (err) {
        console.error('API Error:', err);
        throw error(500, 'Failed to fetch recipes');
    }
}

export async function POST({ request }) {
    console.log('Received POST request to create a new recipe');
    try {
        const recipeData = await request.json();
        
        const newRecipe = await insertRecipe(recipeData);
        
        return json(newRecipe, { status: 201 });
        
    } catch (error) {
        console.error('Error creating recipe:', error);
        
        return json(
            { error: 'Failed to create recipe', message: error.message },
            { status: 400 }
        );
    }
}