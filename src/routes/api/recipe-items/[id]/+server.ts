import { json } from '@sveltejs/kit';
import { deleteRecipeItem } from '$lib/database/queries/recipe_items.js';

export async function DELETE({ params }) {
    try {
        await deleteRecipeItem(parseInt(params.id));
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting recipe item:', error);
        return json({ error: 'Failed to delete recipe item' }, { status: 500 });
    }
}
