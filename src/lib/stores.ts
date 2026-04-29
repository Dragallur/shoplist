import { writable } from 'svelte/store';
import type { Recipe, Ingredient } from "$lib/types"

export let shoppingList = writable<Ingredient[]>([]);
export let _shoppingList = writable<Ingredient[]>([]);
export let selectedRecipe = writable<Recipe | null>(null);
export let recipeList = writable<Recipe[]>([]);
export let selIng = writable<Ingredient[]>([]);
export let _selIng = writable<Ingredient[]>([]);

export let activeHouseholdId = writable<number | null>(null);
export let activeShopId = writable<number | null>(null);