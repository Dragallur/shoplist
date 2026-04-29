import { fail } from "@sveltejs/kit";

import { getItemsByShop, insertItem, getMaxOrdering } from "$lib/database/queries/items";
import { getRecipesByShop } from "$lib/database/queries/recipe";
import { getRecipeItemsByRecipe } from "$lib/database/queries/recipe_items";
import { getShopById } from "$lib/database/queries/shop";

export async function load({ params }) {
  const shopId = params.shopId;

  const [itemsByShop, recipesByShop, shop] = await Promise.all([
    getItemsByShop(shopId),
    getRecipesByShop(shopId),
    getShopById(shopId)
  ]);

  const recipes = await Promise.all(
    recipesByShop.map(async (recipe) => {
      const recipeItems = await getRecipeItemsByRecipe(recipe.id);
      
      return {
        id: recipe.id,
        name: recipe.name,
        ingredients: recipeItems.map((item) => ({
          id: item.id,
          name: item.name
        }))
      };
    })
  );

  const items = itemsByShop.map((item) => ({
    id: item.id,
    name: item.name
  }));

  return {
    items,
    recipes,
    shopId: parseInt(shopId),
    householdId: shop?.household_id ?? null
  };
};


export const actions = {
    addItem: async ({ request, locals, params }) => {
        const data = await request.formData();
        const name = data.get('name');
        const shopId = parseInt(params.shopId);
        const createdBy = locals.user?.id;
        
        if (!name?.trim()) {
            return fail(400, { error: 'Item name is required' });
        }
        
        try {
            // Get the highest ordering value for this shop
            const maxOrdering = await getMaxOrdering(shopId);
            
            const newItem = await insertItem(
                shopId,
                createdBy,
                name.trim(),
                1, // default quantity
                'pcs', // default unit
                maxOrdering + 1
            );
            
            return { success: true, item: newItem };
        } catch (error) {
            console.error('Error adding item:', error);
            return fail(500, { error: 'Failed to add item' });
        }
    }
};


