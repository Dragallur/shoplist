<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { shoppingList, recipeList } from "$lib/stores";
  import { saveToFile, largestKey } from "$lib/utils";
  import { dndzone } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Recipe } from "$lib/types";

  let selectedRecipe: Recipe | null = null;
  let newIngredient: String = "";
  let newRecipe: String = "";

  function addToShoppingList(recipe: Recipe) {
    const keys = $shoppingList.map((item) => item.id);
    const unique_id = (largestKey(keys) + 1).toString();
    for (let i = 0; i < recipe.ingredients.length; i++) {
      shoppingList.update((items) => [
        ...items,
        {
          id: (parseInt(unique_id) + i).toString(),
          name: recipe.ingredients[i].name,
        },
      ]);
    }
    saveToFile("shopping-list.json", $shoppingList);
  }

  function selectRecipe(recipe: Recipe) {
    selectedRecipe = recipe;
  }

  function removeIngredient(index: number) {
    if (selectedRecipe) {
      selectedRecipe.ingredients.splice(index, 1);
      selectedRecipe = selectedRecipe;
      saveToFile("recipe-list.json", $recipeList);
    }
  }

  function addIngredient() {
    if (newIngredient.trim() && selectedRecipe) {
      const keys = selectedRecipe.ingredients.map((item) => item.id);
      const unique_id = (largestKey(keys) + 1).toString();
      selectedRecipe.ingredients.push({
        id: unique_id,
        name: newIngredient.trim(),
      });
      selectedRecipe = selectedRecipe;
      newIngredient = "";
      console.log($recipeList);
    }
    saveToFile("recipe-list.json", $recipeList);
  }

  function addNewRecipe() {
    if (newRecipe.trim() !== "") {
      const keys = $recipeList.map((recipe) => recipe.id);
      const unique_id = (largestKey(keys) + 1).toString();
      recipeList.update((currentRecipes) => [
        ...currentRecipes,
        { id: unique_id, name: newRecipe.trim(), ingredients: [] },
      ]);
      newRecipe = "";
    }
    saveToFile("recipe-list.json", $recipeList);
  }

  function removeRecipe(index: Number) {
    recipeList.update((currentRecipes) =>
      currentRecipes.filter((_, i) => i !== index),
    );
    saveToFile("recipe-list.json", $recipeList);
  }

  function handleDndConsider(e: CustomEvent<DndEvent<Recipe>>) {
    recipeList.update(() => e.detail.items);
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<Recipe>>) {
    recipeList.update(() => e.detail.items);
    saveToFile("recipe-list.json", $recipeList);
  }
  console.log($recipeList);
</script>

<div class="recipe-editor">
  <div class="recipe-list">
    <h2>Recipes</h2>
    <section
      use:dndzone={{ items: $recipeList }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}
    >
      {#each $recipeList as recipe, index (recipe.id)}
        <li class="recipe-item-container">
          <span class="drag-handle">⋮⋮</span>
          <button class="recipe-button" on:click={() => selectRecipe(recipe)}>
            {recipe.name}
          </button>
          <div class="action-buttons">
            <button
              class="action-button add-button"
              on:click={() => addToShoppingList(recipe)}
            >
              Add
            </button>
            <button
              class="action-button edit-button"
              on:click={() => selectRecipe(recipe)}
            >
              Edit
            </button>
            <button
              class="action-button delete-button"
              on:click={() => removeRecipe(index)}
            >
              Delete
            </button>
          </div>
        </li>
      {/each}
    </section>
    <div class="new-recipe">
      <input bind:value={newRecipe} placeholder="New recipe name" />
      <button on:click={addNewRecipe}>Add New Recipe</button>
    </div>
  </div>

  {#if selectedRecipe}
    <div class="recipe-details">
      <h2>{selectedRecipe.name}</h2>
      <ul>
        {#each selectedRecipe.ingredients as ingredient, index}
          <li>
            {ingredient.name}
            <button on:click={() => removeIngredient(index)}>Remove</button>
          </li>
        {/each}
      </ul>
      <div class="add-ingredient">
        <input bind:value={newIngredient} placeholder="New ingredient" />
        <button on:click={addIngredient}>Add</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .recipe-editor {
    display: flex;
    gap: 2rem;
  }

  .recipe-details {
    flex: 2;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    cursor: pointer;
    padding: 0.5rem;
  }

  .selected {
    background-color: #e0e0e0;
  }

  .new-recipe,
  .add-ingredient {
    margin-top: 1rem;
  }

  input {
    margin-right: 0.5rem;
  }

  .recipe-item {
    padding: 0.5em;
    margin: 0.5em 0;
    border: 1px solid #ccc;
    background: white;
    cursor: move;
  }

  section {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .recipe-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .recipe-item-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .recipe-item-container:hover {
    background-color: #f7fafc;
    transform: translateX(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .recipe-button {
    flex-grow: 1;
    text-align: left;
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #2d3748;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .add-button {
    background-color: #38a169;
    color: white;
  }
  .edit-button {
    background-color: #4299e1;
    color: white;
  }

  .delete-button {
    background-color: #f56565;
    color: white;
  }

  .action-button:hover {
    opacity: 0.9;
  }

  /* Add this class for drag handle visual */
  .drag-handle {
    cursor: move;
    color: #a0aec0;
    padding: 0.25rem;
  }
</style>
