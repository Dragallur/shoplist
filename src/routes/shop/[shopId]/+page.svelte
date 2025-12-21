<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { saveToFile } from "$lib/utils";
  import { recipeList } from "$lib/stores";
  import { shoppingList, _shoppingList, activeHouseholdId, activeShopId } from "$lib/stores";
  import type { Ingredient, Recipe } from "$lib/types";
  import ShoppingList from "$lib/components/ShoppingList.svelte";
  import { enhance } from '$app/forms';

  let newItem: String = "";
  export let data;
  
  $: {
    shoppingList.set(data.items);
    recipeList.set(data.recipes);
  }

  export let householdId;
  export let shopId;

  let recipes = [];
  let loading = false;
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

  // If you need optimistic UI updates
  function handleSubmit() {
      loading = true;
      return async ({ result, update }) => {
          loading = false;
          if (result.type === 'success') {
              newItem = ''; // Clear input
          }
          await update(); // This will invalidate and reload data
      };
  }
</script>



<main>
  <h1>Shopping List</h1>

  <form method="POST" action="?/addItem" use:enhance={handleSubmit}>
      <input type="hidden" name="shopId" value={shopId} />
      <input 
          type="text" 
          name="name" 
          bind:value={newItem}
          placeholder="Add new item..."
          disabled={loading}
      />
      <button type="submit" disabled={loading || !newItem.trim()}>
          {loading ? 'Adding...' : 'Add'}
      </button>
  </form>
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
