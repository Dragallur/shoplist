<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { saveToFile, largestKey } from "$lib/utils";
  import { recipeList } from "$lib/stores";
  import { shoppingList } from "$lib/stores";
  import { dndzone } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Ingredient } from "$lib/types";

  let newItem: String = "";

  /** @type {{ data: import('./$types').PageData }} */
  export let data;
  shoppingList.set(data.fileContent["shopping-list.json"]);
  recipeList.set(data.fileContent["recipe-list.json"]);

  function addItem(newItem: String) {
    if (newItem.trim() !== "") {
      const keys = $shoppingList.map((item) => item.id);
      const unique_id = (largestKey(keys) + 1).toString();
      shoppingList.update((items) => [
        ...items,
        { id: unique_id, name: newItem.trim() },
      ]);
      newItem = "";
      saveToFile("shopping-list.json", $shoppingList);
    }
  }

  function handleAddToShoppingList(event: CustomEvent<Ingredient[]>) {
    shoppingList.update((items) => [...items, ...event.detail]);
    saveToFile("shopping-list.json", $shoppingList);
  }

  function handleDndConsider(event: CustomEvent<DndEvent<Ingredient>>) {
    shoppingList.update(() => event.detail.items);
  }

  function handleDndFinalize(event: CustomEvent<DndEvent<Ingredient>>) {
    shoppingList.update(() => event.detail.items);
    saveToFile("shopping-list.json", $shoppingList);
  }

  function removeItem(index: number) {
    shoppingList.update((items) => items.filter((_, i) => i !== index));
    saveToFile("shopping-list.json", $shoppingList);
  }
</script>

<main>
  <h1>Shopping List</h1>

  <form on:submit|preventDefault={() => addItem(newItem)}>
    <input bind:value={newItem} placeholder="Add new item" />
    <button type="submit">Add</button>
  </form>

  <section
    use:dndzone={{ items: $shoppingList }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each $shoppingList as item, index (item.id)}
      <div class="item">
        {item.name}
        <button on:click={() => removeItem(index)}>Remove</button>
      </div>
    {/each}
  </section>
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
  .item {
    padding: 0.5em;
    margin: 0.5em 0;
    border: 1px solid #ccc;
    background: white;
    cursor: move;
    transition: transform 0.2s;
  }
  .item:hover {
    transform: scale(1.01);
  }
  .item:active {
    transform: scale(0.99);
  }
</style>
