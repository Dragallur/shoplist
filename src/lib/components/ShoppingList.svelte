<script lang="ts">
  import { dndzone, TRIGGERS } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import { createEventDispatcher, tick } from "svelte";
  import { saveToFile } from "$lib/utils";
  import type { Ingredient, Recipe } from "$lib/types";
  import type { Writable } from "svelte/store";

  export let shoppingList: Writable<Ingredient[]>;
  export let _shoppingList: Writable<Ingredient[]>;
  const dispatch = createEventDispatcher();

  function handleDndConsider(e: CustomEvent<DndEvent<Ingredient>>) {
    const {
      items: newItems,
      info: { trigger, id },
    } = e.detail;

    if (trigger === TRIGGERS.DRAG_STARTED) {
      const draggedItem = $shoppingList.find((item) => item.id === id);
      dispatch("listdrag", { item: { ...draggedItem } });
    }

    _shoppingList.update(() => newItems);

    const existingItem = $shoppingList.find((item) => item.id === id);
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        id: Date.now().toString(),
        name: existingItem.name || "Untitled",
      };

      shoppingList.update((items) => {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index] = updatedItem;
        }
        return items;
      });
    }
    saveToFile("shopping-list.json", $shoppingList);
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
      _shoppingList.update(() => newItems);
      shoppingList.update(() => $_shoppingList);
    } else {
      _shoppingList.update(() => $shoppingList);
    }
    tick().then(() => dispatch("listdrag", {}));
    saveToFile("shopping-list.json", $shoppingList);
  }
  _shoppingList.update(() => $shoppingList);

  function removeItem(index: number) {
    $shoppingList = $shoppingList.filter((_, i) => i !== index);
    saveToFile("shopping-list.json", $shoppingList);
    _shoppingList.set($shoppingList);
  }
</script>

<section
  use:dndzone={{
    items: $_shoppingList,
    dropFromOthersDisabled: false,
    type: "ingredients",
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each $_shoppingList as ingredient, index (ingredient.id)}
    <li class="recipe-item-container">
      <span class="drag-handle">⋮⋮</span>
      <span class="ingredient-name">{ingredient.name}</span>
      <div class="action-buttons">
        <button
          class="action-button delete-button"
          on:click={() => removeItem(index)}
        >
          Delete
        </button>
      </div>
    </li>
  {/each}
</section>
