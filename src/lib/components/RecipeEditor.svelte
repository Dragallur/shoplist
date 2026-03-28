<script lang="ts">
  import {
    shoppingList,
    _shoppingList,
    selectedRecipe,
    selIng,
    _selIng,
    recipeList,
    activeShopId,
  } from "$lib/stores";
  import { dndzone, TRIGGERS } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Recipe } from "$lib/types";
  import IngredientList from "$lib/components/IngredientList.svelte";

  let newIngredient: String = "";
  let newRecipe: String = "";

  async function addToShoppingList(recipe: Recipe) {
    for (let i = 0; i < recipe.ingredients.length; i++) {
      shoppingList.update((items) => [
        ...items,
        { id: Date.now().toString() + "_" + i.toString(), name: recipe.ingredients[i].name },
      ]);
    }
    _shoppingList.set($shoppingList);
    const shopId = parseInt($activeShopId as string);
    const res = await fetch('/api/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId, items: $shoppingList })
    });
    const newItems = await res.json();
    shoppingList.update(() => newItems);
    _shoppingList.update(() => newItems);
  }

  function selectRecipe(recipe: Recipe) {
    selectedRecipe.update(() => recipe);
    selIng.set($selectedRecipe.ingredients);
    _selIng.set($selectedRecipe.ingredients);
  }

  async function addNewRecipe() {
    if (!newRecipe.trim()) return;
    const shopId = parseInt($activeShopId as string);
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRecipe.trim(), shopId })
    });
    if (!response.ok) {
      console.error('Error creating recipe');
      return;
    }
    const recipe = await response.json();
    recipeList.update((currentRecipes) => [
      ...currentRecipes,
      { ...recipe, ingredients: [] }
    ]);
    newRecipe = "";
  }

  async function removeRecipe(index: Number) {
    const recipe = $recipeList[index as number];
    await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' })
      .catch(err => console.error('Error deleting recipe:', err));
    recipeList.update((currentRecipes) =>
      currentRecipes.filter((_, i) => i !== index),
    );
  }

  function handleDndConsider(e: CustomEvent<DndEvent<Recipe>>) {
    recipeList.update(() => e.detail.items);
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<Recipe>>) {
    recipeList.update(() => e.detail.items);
    fetch('/api/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipes: $recipeList.map((r, i) => ({ id: r.id, ordering: i })) })
    }).catch(err => console.error('Error saving recipe order:', err));
  }
</script>

<div class="recipe-editor">
  <div class="recipe-list">
    <h2>Recipes</h2>
    <section
      use:dndzone={{ items: $recipeList, type: "recipes" }}
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

  {#if $selectedRecipe}
    <IngredientList
      {selectedRecipe}
      {selIng}
      {_selIng}
      {newIngredient}
      {recipeList}
    />
  {/if}
</div>
