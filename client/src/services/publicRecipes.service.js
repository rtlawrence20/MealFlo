import { http } from "./http.js";

/**
 * Public recipes (no auth required).
 */
export const publicRecipesService = {
    list() {
        return http.get("/public/recipes");
    },
    getById(recipeId) {
        return http.get(`/public/recipes/${recipeId}`);
    },
};
