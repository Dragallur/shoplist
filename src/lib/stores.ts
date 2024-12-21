import { writable } from 'svelte/store';

export type Recipe = {
    name: String;
    ingredients: String[];
};
export const recipeList = writable<Recipe[]>([]);