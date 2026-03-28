<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { recipeList } from "$lib/stores";
  import { shoppingList, _shoppingList } from "$lib/stores";
  import ShoppingList from "$lib/components/ShoppingList.svelte";
  import { enhance } from '$app/forms';

  let newItem: String = "";
  export let data;

  $: {
    shoppingList.set(data.items);
    _shoppingList.set(data.items);
    recipeList.set(data.recipes);
  }

  let loading = false;

  function handleSubmit() {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      if (result.type === 'success') {
        newItem = '';
      }
      await update();
    };
  }
</script>

<main>
  <h1>Shopping List</h1>

  <form method="POST" action="?/addItem" use:enhance={handleSubmit}>
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

  <ShoppingList {shoppingList} {_shoppingList} />
  <RecipeEditor />
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
