import { onMount } from "svelte";
import { writable } from "svelte/store";

let shoppingList = writable<String[]>([]);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    try {
        const response = await fetch("../public/shopping-list.json");
        const data = await response.json();
        return { shoppingList: data };
    } catch (error) {
        console.error("Error loading shopping list:", error);
        return { shoppingList: [] };
    }
}

//onMount(async () => {
//   try {
//      const response = await fetch("/shopping-list.json");
//     const data = await response.json();
//    shoppingList.set(data);
//    } catch (error) {
//       console.error("Error loading shopping list:", error);
//  }
//});