<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { shoppingList, recipeList, highestId } from "$lib/stores";
  import { shouldIgnoreDndEvents, currentZone } from "$lib/stores";
  import { saveToFile, largestKey } from "$lib/utils";
  import {
    dndzone,
    TRIGGERS,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
  } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Ingredient, Recipe } from "$lib/types";

  let selectedRecipe: Recipe | null = null;
  let newIngredient: String = "";
  let newRecipe: String = "";

  function addToShoppingList(recipe: Recipe) {
    for (let i = 0; i < recipe.ingredients.length; i++) {
      highestId.set($highestId + 1);
      shoppingList.update((items) => [
        ...items,
        {
          id: $highestId.toString(),
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
      highestId.set($highestId + 1);
      selectedRecipe.ingredients.push({
        id: $highestId.toString(),
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
      highestId.set($highestId + 1);
      recipeList.update((currentRecipes) => [
        ...currentRecipes,
        { id: $highestId.toString(), name: newRecipe.trim(), ingredients: [] },
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

  //  function handleIngredientDndConsider(e: CustomEvent<DndEvent<Ingredient>>) {
  //    if (selectedRecipe) {
  //      selectedRecipe.ingredients = e.detail.items;
  //      selectedRecipe = selectedRecipe;
  //    }
  //  }

  //  function handleIngredientDndFinalize(e: CustomEvent<DndEvent<Ingredient>>) {
  //    if (selectedRecipe) {
  //      selectedRecipe.ingredients = e.detail.items;
  //      selectedRecipe = selectedRecipe;
  //      saveToFile("recipe-list.json", $recipeList);
  //    }
  //  }

  function handleIngredientDndConsider(e, text) {
    const { trigger, id } = e.detail.info;
    if (trigger === TRIGGERS.DRAG_STARTED) {
      const idx = selectedRecipe.ingredients.findIndex(
        (item) => item.id === id,
      );
      highestId.set($highestId + 1);
      // the line below was added in order to be compatible with version svelte-dnd-action 0.7.4 and above
      e.detail.items = e.detail.items.filter(
        (item) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME],
      );
      e.detail.items.splice(idx, 0, {
        ...selectedRecipe?.ingredients[idx],
        id: $highestId.toString(),
      });
      selectedRecipe.ingredients = e.detail.items;
      shouldIgnoreDndEvents.set(true);
    } else if (!$shouldIgnoreDndEvents) {
      selectedRecipe.ingredients = e.detail.items;
    } else {
      selectedRecipe.ingredients = [...selectedRecipe.ingredients];
    }
  }
  function handleIngredientDndFinalize(e, text) {
    console.log("RECIPE EDITOR", text);
    if (!$shouldIgnoreDndEvents) {
      selectedRecipe.ingredients = e.detail.items;
    } else {
      selectedRecipe.ingredients = [...selectedRecipe.ingredients];
      shouldIgnoreDndEvents.set(false);
    }
  }

  function check() {
    //console.log("RECIPE LIST", $recipeList);
    console.log("SHOPPING LIST", $shoppingList);
    console.log("ID", $highestId);
    //console.log("SEL RECIPE", selectedRecipe);
    console.log("SEL RECIPE, INGREDIENTS", selectedRecipe?.ingredients);
  }
</script>

<div class="recipe-editor">
  <button on:click={check}>Check</button>
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

  {#if selectedRecipe}
    <div class="recipe-details">
      <h2>{selectedRecipe.name}</h2>
      <section
        use:dndzone={{
          items: selectedRecipe.ingredients,
          type: "ingredients",
        }}
        on:consider={(e) => handleIngredientDndConsider(e, "recipeIngredients")}
        on:finalize={(e) => handleIngredientDndFinalize(e, "recipeIngredients")}
      >
        {#each selectedRecipe.ingredients as ingredient, index (ingredient.id)}
          <li class="recipe-item-container">
            <span class="drag-handle">⋮⋮</span>
            <span class="ingredient-name">{ingredient.name}</span>
            <div class="action-buttons">
              <button
                class="action-button delete-button"
                on:click={() => removeIngredient(index)}
              >
                Delete
              </button>
            </div>
          </li>
        {/each}
      </section>

      <div class="add-ingredient">
        <input
          bind:value={newIngredient}
          placeholder="New ingredient"
          on:keydown={(e) => e.key === "Enter" && addIngredient()}
        />
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

  .new-recipe,
  .add-ingredient {
    margin-top: 1rem;
  }

  input {
    margin-right: 0.5rem;
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

  .drag-handle {
    cursor: move;
    color: #a0aec0;
    padding: 0.25rem;
  }
</style>
