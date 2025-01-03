<script lang="ts">
  import RecipeEditor from "$lib/components/RecipeEditor.svelte";
  import { saveToFile, largestKey } from "$lib/utils";
  import { recipeList, highestId, currentZone } from "$lib/stores";
  import { shoppingList } from "$lib/stores";
  import { dndzone, TRIGGERS } from "svelte-dnd-action";
  import type { DndEvent } from "svelte-dnd-action";
  import type { Ingredient } from "$lib/types";

  let newItem: String = "";

  /** @type {{ data: import('./$types').PageData }} */
  export let data;
  shoppingList.set(data.fileContent["shopping-list.json"]);
  recipeList.set(data.fileContent["recipe-list.json"]);

  // Find the highest id in the shopping list and recipe list

  const keys = [...$shoppingList, ...$recipeList].map((item) =>
    parseInt(item.id),
  );
  highestId.set(Math.max(...keys) + 1);
  if ($highestId === -Infinity) {
    highestId.set(0);
  }

  function addItem(newItem: String) {
    if (newItem.trim() !== "") {
      highestId.set($highestId + 1);
      shoppingList.update((items) => [
        ...items,
        { id: $highestId.toString(), name: newItem.trim() },
      ]);
      newItem = "";
      saveToFile("shopping-list.json", $shoppingList);
    }
  }

  function handleAddToShoppingList(event: CustomEvent<Ingredient[]>) {
    shoppingList.update((items) => [...items, ...event.detail]);
    saveToFile("shopping-list.json", $shoppingList);
  }

  function handleDndConsider(event: CustomEvent<DndEvent<Ingredient>>, text) {
    shoppingList.update(() => event.detail.items);
  }

  function handleDndFinalize(event: CustomEvent<DndEvent<Ingredient>>, text) {
    shoppingList.update(() => event.detail.items);
    saveToFile("shopping-list.json", $shoppingList);
  }

  function removeItem(index: number) {
    shoppingList.update((items) => items.filter((_, i) => i !== index));
    saveToFile("shopping-list.json", $shoppingList);
  }

  import { createEventDispatcher, tick } from "svelte";
  import { flip } from "svelte/animate";
  const flipDurationMs = 100;
  const dispatch = createEventDispatcher();
  function handleSort(e) {
    let {
      detail: {
        items: newItems,
        info: { trigger, id },
      },
    } = e;
    if (trigger === TRIGGERS.DRAG_STARTED) {
      dispatch("listdrag", {
        item: { ...ALL_ITEMS.find((item) => item.id === id) },
      });
    }
    items = newItems;
    // find the item that is being dragged and increase its id by 1
    highestId.set($highestId + 1);
    items = items.map((item) => {
      if (item.id === id) {
        return { ...item, id: highestId };
      }
      return item;
    });
    console.log("BBB", items, items2, newItems);
  }
  function handleDrop(e) {
    const {
      detail: {
        items: newItems,
        info: { trigger },
      },
    } = e;
    console.warn({ trigger });
    if (
      trigger === TRIGGERS.DROPPED_INTO_ZONE ||
      trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY
    ) {
      console.log("CCC", items, newItems);
      //items = newItems;///////////
      ALL_ITEMS = items;
    } else {
      console.log("dropped into widget");
      items = ALL_ITEMS;
    }
    tick().then(() => dispatch("listdrag", {}));
  }
  function handleSort2(e) {
    const {
      detail: {
        items: newItems,
        info: { trigger, id },
      },
    } = e;
    if (trigger === TRIGGERS.DRAG_STARTED) {
      dispatch("listdrag", {
        item: { ...ALL_ITEMS2.find((item) => item.id === id) },
      });
    }
    items2 = newItems;
  }
  function handleDrop2(e) {
    const {
      detail: {
        items: newItems,
        info: { trigger },
      },
    } = e;
    console.log("AAA", newItems);
    console.warn({ trigger });
    if (
      trigger === TRIGGERS.DROPPED_INTO_ZONE ||
      trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY
    ) {
      items2 = newItems;
      ALL_ITEMS2 = items2;
    } else {
      console.log("dropped into widget2");
      items2 = ALL_ITEMS2;
    }
    tick().then(() => dispatch("listdrag", {}));
  }
  let ALL_ITEMS = [
    { id: 1, title: "I" },
    { id: 2, title: "Am" },
    { id: 3, title: "Yoda" },
  ];
  let ALL_ITEMS2 = [
    { id: 4, title: "II" },
    { id: 5, title: "AAm" },
    { id: 6, title: "YYoda" },
  ];
  let items = [...ALL_ITEMS];
  let items2 = [...ALL_ITEMS2];

  function check() {
    console.log("ITEMS", items);
    console.log("ITEMS2", items2);
  }
</script>

<main>
  <button on:click={check}>Check</button>
  <section
    use:dndzone={{ items, flipDurationMs }}
    on:consider={handleSort}
    on:finalize={handleDrop}
  >
    {#each items as item (item.id)}
      <div animate:flip={{ duration: flipDurationMs }}>
        {item.title}
      </div>
    {/each}
  </section>
  <h1>Shopping List</h1>
  <section
    use:dndzone={{ items: items2, flipDurationMs }}
    on:consider={handleSort2}
    on:finalize={handleDrop2}
  >
    {#each items2 as item (item.id)}
      <div animate:flip={{ duration: flipDurationMs }}>
        {item.title}
      </div>
    {/each}
  </section>
  <h1>Shopping List</h1>

  <form on:submit|preventDefault={() => addItem(newItem)}>
    <input bind:value={newItem} placeholder="Add new item" />
    <button type="submit">Add</button>
  </form>

  <section
    use:dndzone={{ items: $shoppingList, type: "ingredients" }}
    on:consider={(e) => handleDndConsider(e, "ingredients")}
    on:finalize={(e) => handleDndFinalize(e, "ingredients")}
  >
    {#each $shoppingList as item, index (item.id)}
      <div class="item">
        {item.name}
        <button on:click={() => removeItem(index)}>Remove</button>
      </div>
    {/each}
  </section>
  <RecipeEditor on:addToShoppingList={handleAddToShoppingList} />
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
  .item {
    padding: 0.5em;
    margin: 0.5em 0;
    border: 1px solid #ccc;
    background: white;
    cursor: move;
    transition: transform 0.2s;
  }
  .item:hover {
    transform: scale(1.01);
  }
  .item:active {
    transform: scale(0.99);
  }
</style>
