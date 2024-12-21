<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { writable } from "svelte/store";
  import { recipeList } from "$lib/stores";

  let shoppingList = writable<String[]>([]);
  let newItem: String = "";
  type Recipe = {
    name: String;
    ingredients: String[];
  };
  let recipes = writable<Recipe[]>([]);

  /** @type {{ data: import('./$types').PageData }} */
  export let data;
  shoppingList.set(data.fileContent["shopping-list.json"]);
  recipes.set(data.fileContent["recipe-list.json"]);
  console.log("Shopping list loaded:", $shoppingList);
  console.log("Recipes loaded:", $recipes);

  function addItem() {
    if (newItem.trim() !== "") {
      shoppingList.update((items) => [...items, newItem.trim()]);
      newItem = "";
      saveList("shopping-list.json", $shoppingList);
    }
  }

  function removeItem(index: Number) {
    shoppingList.update((items) => items.filter((_, i) => i !== index));
    saveList("shopping-list.json", $shoppingList);
  }

  function handleAddToShoppingList(event: CustomEvent<{ detail: String[] }>) {
    shoppingList.update((items) => [...items, ...event.detail.detail]);
    saveList("shopping-list.json", $shoppingList);
  }

  async function saveList(filename: string, content: String[]) {
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();
      console.log("Changes saved successfully:", result);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  }
</script>

<main>
  <h1>Shopping List</h1>

  <form on:submit|preventDefault={addItem}>
    <input bind:value={newItem} placeholder="Add new item" />
    <button type="submit">Add</button>
  </form>

  <ul>
    {#each $shoppingList as item, index}
      <li>
        {item}
        <button on:click={() => removeItem(index)}>Remove</button>
      </li>
    {/each}
  </ul>

  <RecipeEditor on:addToShoppingList={handleAddToShoppingList} />
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin-bottom: 10px;
  }
  input {
    margin-right: 10px;
  }
</style>
