<script lang="ts">
  import {
    shoppingList,
    _shoppingList,
    selectedRecipe,
    recipeList,
  } from "$lib/stores";
  import { saveToFile } from "$lib/utils";
  import { dndzone } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Recipe } from "$lib/types";
  import IngredientList from "$lib/components/IngredientList.svelte";

  let newIngredient: String = "";
  let newRecipe: String = "";

  function addToShoppingList(recipe: Recipe) {
    for (let i = 0; i < recipe.ingredients.length; i++) {
      shoppingList.update((items) => [
        ...items,
        {
          id: Date.now().toString() + "_" + i.toString(),
          name: recipe.ingredients[i].name,
        },
      ]);
    }
    saveToFile("shopping-list.json", $shoppingList);
    _shoppingList.set($shoppingList);
  }

  function selectRecipe(recipe: Recipe) {
    selectedRecipe.update(() => recipe);
  }

  function addNewRecipe() {
    if (newRecipe.trim() !== "") {
      recipeList.update((currentRecipes) => [
        ...currentRecipes,
        { id: Date.now().toString(), name: newRecipe.trim(), ingredients: [] },
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
      {newIngredient}
      {recipeList}
    />
  {/if}
</div>
