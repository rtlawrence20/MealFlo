import { http } from "./http.js";

/**
 * @typedef {Object} RecipeIngredient
 * @property {number} [id]
 * @property {number} [recipeId]
 * @property {string} name
 * @property {number|null} [quantity]
 * @property {string|null} [unit]
 * @property {string|null} [notes]
 * @property {number} [sortOrder]
 */

/**
 * @typedef {Object} Recipe
 * @property {number} id
 * @property {number} userId
 * @property {string} title
 * @property {string|null} description
 * @property {number} servings
 * @property {number|null} [prepMin]
 * @property {number|null} [cookMin]
 * @property {string|null} [instructions]
 * @property {string|null} [notes]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {RecipeIngredient[]} [ingredients]
 */

/**
 * @typedef {Object} RecipeCreatePayload
 * @property {string} title
 * @property {string|null} [description]
 * @property {number} [servings]
 * @property {number|null} [prepMin]
 * @property {number|null} [cookMin]
 * @property {string|null} [instructions]
 * @property {string|null} [notes]
 * @property {RecipeIngredient[]} [ingredients]
 */

/**
 * @typedef {Object} RecipeUpdatePayload
 * @property {string} [title]
 * @property {string|null} [description]
 * @property {number} [servings]
 * @property {number|null} [prepMin]
 * @property {number|null} [cookMin]
 * @property {string|null} [instructions]
 * @property {string|null} [notes]
 * @property {RecipeIngredient[]} [ingredients]
 */

export const recipesService = {
    /**
     * @returns {Promise<Recipe[]>}
     */
    list() {
        return http.get("/recipes");
    },

    /**
     * @param {number} recipeId
     * @returns {Promise<Recipe>}
     */
    get(recipeId) {
        return http.get(`/recipes/${recipeId}`);
    },

    /**
     * @param {RecipeCreatePayload} payload
     * @returns {Promise<Recipe>}
     */
    create(payload) {
        return http.post("/recipes", payload);
    },

    /**
     * @param {number} recipeId
     * @param {RecipeUpdatePayload} payload
     * @returns {Promise<Recipe>}
     */
    update(recipeId, payload) {
        return http.patch(`/recipes/${recipeId}`, payload);
    },

    /**
     * @param {number} recipeId
     * @returns {Promise<{status: string}>}
     */
    remove(recipeId) {
        return http.delete(`/recipes/${recipeId}`);
    },

    publish(recipeId) {
        return http.post(`/recipes/${recipeId}/publish`, {});
    },
    unpublish(recipeId) {
        return http.post(`/recipes/${recipeId}/unpublish`, {});
    },

};
