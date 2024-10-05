<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let recipes = writable([]);
  let selectedRecipe = null;
  let newIngredient = "";
  let newRecipe = "";

  onMount(async () => {
    try {
      const response = await fetch("/recipes.json");
      recipes.set(await response.json());
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  });

  function addToShoppingList(recipe) {
    dispatch("addToShoppingList", {
      detail: recipe.ingredients,
    });
  }

  function selectRecipe(recipe) {
    selectedRecipe = recipe;
  }

  function removeIngredient(index) {
    selectedRecipe.ingredients.splice(index, 1);
    selectedRecipe = selectedRecipe;
    saveRecipes();
  }

  function addIngredient() {
    if (newIngredient.trim()) {
      selectedRecipe.ingredients.push(newIngredient.trim());
      selectedRecipe = selectedRecipe;
      newIngredient = "";
    }
    saveRecipes();
  }

  function addNewRecipe() {
    if (newRecipe.trim() !== "") {
      recipes.update((currentRecipes) => [
        ...currentRecipes,
        { name: newRecipe.trim(), ingredients: [] },
      ]);
      newRecipe = "";
    }
    saveRecipes();
  }

  function removeRecipe(index) {
    recipes.update((currentRecipes) =>
      currentRecipes.filter((_, i) => i !== index),
    );
    saveRecipes();
  }

  async function saveRecipes() {
    try {
      await fetch("/save-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify($recipes),
      });
    } catch (error) {
      console.error("Error saving recipe list:", error);
    }
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
          <button on:click={addToShoppingList(recipe)}>Add</button>
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
