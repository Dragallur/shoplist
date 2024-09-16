<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let shoppingList = writable([]);
  let newItem = '';

  onMount(async () => {
    try {
      const response = await fetch('/shopping-list.json');
      const data = await response.json();
      shoppingList.set(data);
    } catch (error) {
      console.error('Error loading shopping list:', error);
    }
  });

  function addItem() {
    if (newItem.trim()) {
      shoppingList.update(items => [...items, newItem.trim()]);
      newItem = '';
      saveList();
    }
  }

  function removeItem(index) {
    shoppingList.update(items => items.filter((_, i) => i !== index));
    saveList();
  }

  async function saveList() {
    try {
      await fetch('/save-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify($shoppingList)
      });
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  }
</script>

<main>
  <h1>Shopping List</h1>
  
  <form on:submit|preventDefault={addItem}>
    <input bind:value={newItem} placeholder="Add new item">
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
