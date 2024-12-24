import { writable } from 'svelte/store';
import type { Recipe, Ingredient } from "$lib/types"

export let shoppingList = writable<Ingredient[]>([]);
export let recipeList = writable<Recipe[]>([]);