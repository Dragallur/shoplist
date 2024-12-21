<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import { recipeList } from "$lib/stores";

  const dispatch = createEventDispatcher();

  type Recipe = {
    name: String;
    ingredients: String[];
  };
  let recipes = writable<Recipe[]>([]);
  let selectedRecipe: Recipe | null = null;
  let newIngredient: String = "";
  let newRecipe: String = "";

  async function saveRecipes(filename: string, content: Recipe[]) {
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

  function addToShoppingList(recipe: Recipe) {
    dispatch("addToShoppingList", {
      detail: recipe.ingredients,
    });
  }

  function selectRecipe(recipe: Recipe) {
    selectedRecipe = recipe;
  }

  function removeIngredient(index: number) {
    if (selectedRecipe) {
      selectedRecipe.ingredients.splice(index, 1);
      selectedRecipe = selectedRecipe;
      saveRecipes("recipe-list.json", $recipes);
    }
  }

  function addIngredient() {
    if (newIngredient.trim() && selectedRecipe) {
      selectedRecipe.ingredients.push(newIngredient.trim());
      selectedRecipe = selectedRecipe;
      newIngredient = "";
    }
    saveRecipes("recipe-list.json", $recipes);
  }

  function addNewRecipe() {
    if (newRecipe.trim() !== "") {
      recipes.update((currentRecipes) => [
        ...currentRecipes,
        { name: newRecipe.trim(), ingredients: [] },
      ]);
      newRecipe = "";
    }
    saveRecipes("recipe-list.json", $recipes);
  }

  function removeRecipe(index: Number) {
    recipes.update((currentRecipes) =>
      currentRecipes.filter((_, i) => i !== index),
    );
    saveRecipes("recipe-list.json", $recipes);
  }
</script>

<div class="recipe-editor">
  <div class="recipe-list">
    <h2>Recipes</h2>
    <ul>
      {#each $recipes as recipe, index}
        <li
          on:click={() => selectRecipe(recipe)}
          class:selected={selectedRecipe === recipe}
        >
          {recipe.name}
          <button on:click={() => removeRecipe(index)}>Remove</button>
          <button on:click={() => addToShoppingList(recipe)}>Add</button>
        </li>
      {/each}
    </ul>
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
            {ingredient}
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

  .recipe-list {
    flex: 1;
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
</style>
