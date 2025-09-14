<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { saveToFile } from "$lib/utils";
  import { recipeList } from "$lib/stores";
  import { shoppingList, _shoppingList } from "$lib/stores";
  import type { Ingredient } from "$lib/types";
  import ShoppingList from "$lib/components/ShoppingList.svelte";

  let newItem: String = "";

  /** @type {{ data: import('./$types').PageData }} */
  export let data;
  shoppingList.set(data.fileContent["shopping-list.json"]);
  recipeList.set(data.fileContent["recipe-list.json"]);

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
