import { json } from '@sveltejs/kit';
import { deleteRecipe } from '$lib/database/queries/recipe.js';

export async function DELETE({ params }) {
    try {
        await deleteRecipe(parseInt(params.id));
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return json({ error: 'Failed to delete recipe' }, { status: 500 });
    }
}
