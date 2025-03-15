<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Ingredient, Recipe } from "$lib/types";

  import { createEventDispatcher, tick } from "svelte";
  import { writable } from "svelte/store";
  import { dndzone, TRIGGERS } from "svelte-dnd-action";
  import { saveToFile } from "$lib/utils";

  export let selectedRecipe: Writable<Recipe>;
  export let newIngredient: String;
  export let recipeList;
  let selIng: Writable<Ingredient[]> = writable([]);
  let _selIng: Writable<Ingredient[]> = writable([]);
  selIng.set($selectedRecipe.ingredients);
  _selIng.set($selectedRecipe.ingredients);

  const dispatch = createEventDispatcher();

  function handleDndConsider(e: CustomEvent<DndEvent<Ingredient>>) {
    const {
      items: newItems,
      info: { trigger, id },
    } = e.detail;

    if (trigger === TRIGGERS.DRAG_STARTED) {
      const draggedItem = $selIng.find((item) => item.id === id);
      dispatch("listdrag", { item: { ...draggedItem } });
    }

    _selIng.update(() => newItems);

    const existingItem = $selIng.find((item) => item.id === id);
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        id: Date.now().toString(),
        name: existingItem.name || "Untitled",
      };

      selIng.update((items) => {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index] = updatedItem;
        }
        return items;
      });
    }
    $selectedRecipe.ingredients = $selIng;
    saveToFile("recipe-list.json", $recipeList);
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<Ingredient>>) {
    const {
      detail: {
        items: newItems,
        info: { trigger },
      },
    } = e;
    if (
      trigger === TRIGGERS.DROPPED_INTO_ZONE ||
      trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY
    ) {
      _selIng.update(() => newItems);
      selIng.update(() => $_selIng);
    } else {
      _selIng.update(() => $selIng);
    }
    tick().then(() => dispatch("listdrag", {}));
    $selectedRecipe.ingredients = $selIng;
    saveToFile("recipe-list.json", $recipeList);
  }

  function removeIngredient(index: number) {
    if (selectedRecipe) {
      $selIng.splice(index, 1);
      selectedRecipe = selectedRecipe;
      $_selIng = $selIng;
      $selectedRecipe.ingredients = $selIng;
      saveToFile("recipe-list.json", $recipeList);
    }
  }

  function addIngredient() {
    if (newIngredient.trim() && selectedRecipe) {
      $selIng.push({
        id: Date.now().toString(),
        name: newIngredient.trim(),
      });
      selectedRecipe = selectedRecipe;
      newIngredient = "";
    }
    $_selIng = $selIng;
    $selectedRecipe.ingredients = $selIng;
    saveToFile("recipe-list.json", $recipeList);
  }
</script>

<div class="recipe-details">
  <h2>{$selectedRecipe.name}</h2>
  <section
    use:dndzone={{
      items: $_selIng,
      type: "ingredients",
    }}
    on:consider={(e) => handleDndConsider(e)}
    on:finalize={(e) => handleDndFinalize(e)}
  >
    {#each $_selIng as ingredient, index (ingredient.id)}
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

