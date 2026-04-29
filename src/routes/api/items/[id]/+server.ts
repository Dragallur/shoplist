import { json } from '@sveltejs/kit';
import { deleteItem } from '$lib/database/queries/items.js';

export async function DELETE({ params }) {
    try {
        await deleteItem(parseInt(params.id));
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
