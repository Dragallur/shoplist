<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { saveToFile } from "$lib/utils";
  import { recipeList } from "$lib/stores";
  import { shoppingList, _shoppingList, activeHouseholdId, activeShopId } from "$lib/stores";
  import type { Ingredient, Recipe } from "$lib/types";
  import ShoppingList from "$lib/components/ShoppingList.svelte";

  import { getItemsByShop } from "$lib/database/queries/items";
  import { getRecipesByShop } from "$lib/database/queries/recipe";

  let newItem: String = "";

 // /** @type {{ data: import('./$types').PageData }} */
 // export let data;
 // shoppingList.set(data.fileContent["shopping-list.json"]);
 // recipeList.set(data.fileContent["recipe-list.json"]);
  // Load shopping list and recipe list from database
  let itemsByShop = await getItemsByShop($activeShopId);
  let recipesByShop = await getRecipesByShop($activeShopId);

  let _items: Ingredient[] = itemsByShop.map((item) => ({
    id: item.id,
    name: item.name
  }));
  let _recipes: Recipe[] = recipesByShop.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
  }));
  shoppingList.set(_items);
  recipeList.set(_recipes);


  export let householdId;
  export let shopId;

  let recipes = [];
  let loading = true;
  let error = null;

  async function fetchRecipes() {
      try {
          loading = true;
          const response = await fetch(`/api/database/recipes?household_id=${householdId}&shop_id=${shopId}`);
          
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          recipes = await response.json();
      } catch (err) {
          console.error('Error fetching recipes:', err);
          error = err.message;
      } finally {
          loading = false;
      }
  }

  async function createRecipe() {
      const recipeData = {
          name: "test",
          shop_id: 1,
          created_by: 1,
          description: "description",
      };
      console.log(JSON.stringify(recipeData)); 
      try {
          const response = await fetch('/api/database/recipes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(recipeData)
          });
          
          const result = await response.json();
          console.log('Recipe created:', result);
      } catch (error) {
          console.error('Error:', error);
      }
  }
  console.log("Fetching recipes...");
  createRecipe();
  console.log("Recipes fetched:");
  //console.log(fetchRecipes());

  function addItem() {
    if (newItem.trim() !== "") {
      shoppingList.update((items) => [
        ...items,
        { id: Date.now().toString(), name: newItem.trim() },
      ]);
      newItem = "";
      saveToFile("shopping-list.json", $shoppingList);
      _shoppingList.set($shoppingList);
    }
  }

  function handleAddToShoppingList(event: CustomEvent<Ingredient[]>) {
    shoppingList.update((items) => [...items, ...event.detail]);
    saveToFile("shopping-list.json", $shoppingList);
  }
</script>

<main>
  <h1>Shopping List</h1>

  <form on:submit|preventDefault={addItem}>
    <input bind:value={newItem} placeholder="Add new item" />
    <button type="submit">Add</button>
  </form>

  <ShoppingList {shoppingList} {_shoppingList} />
  <RecipeEditor on:addToShoppingList={handleAddToShoppingList} />
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  input {
    margin-right: 10px;
  }
</style>
