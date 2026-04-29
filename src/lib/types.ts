export type Recipe = {
    id: string | number;
    name: string;
    ingredients: Ingredient[];
};

export type Ingredient = {
    id: string | number;
    name: string;
}
