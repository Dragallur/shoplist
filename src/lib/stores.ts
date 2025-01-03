import { writable } from 'svelte/store';
import type { Recipe, Ingredient } from "$lib/types"

export let shoppingList = writable<Ingredient[]>([]);
export let recipeList = writable<Recipe[]>([]);
export let highestId = writable<number>(0);
export let shouldIgnoreDndEvents = writable<boolean>(false);
export let currentZone = writable<string>("");