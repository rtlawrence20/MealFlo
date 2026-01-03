import { http } from "./http.js";

/**
 * @typedef {Object} MealPlanWeek
 * @property {number} id
 * @property {number} userId
 * @property {string} weekStart
 * @property {string} createdAt
 * @property {MealGroup[]} [mealGroups]
 */

/**
 * @typedef {Object} MealGroupRecipe
 * @property {number} id
 * @property {number} mealGroupId
 * @property {number} recipeId
 * @property {number} plannedServings
 * @property {number} sortOrder
 * @property {any} [recipe]
 */

/**
 * @typedef {Object} MealGroup
 * @property {number} id
 * @property {number} weekId
 * @property {string} day
 * @property {string} name
 * @property {number} sortOrder
 * @property {MealGroupRecipe[]} [recipes]
 */

/**
 * @typedef {Object} CreateWeekPayload
 * @property {string} weekStart
 */

/**
 * @typedef {Object} CreateMealGroupPayload
 * @property {number} weekId
 * @property {string} day
 * @property {string} name
 * @property {number} [sortOrder]
 */

/**
 * @typedef {Object} AddRecipeToGroupPayload
 * @property {number} recipeId
 * @property {number} [plannedServings]
 * @property {number} [sortOrder]
 */

export const plannerService = {
    /**
     * Create or fetch an existing week by weekStart.
     * @param {CreateWeekPayload} payload
     * @returns {Promise<MealPlanWeek>}
     */
    createOrGetWeek(payload) {
        return http.post("/meal-plans/weeks", payload);
    },

    /**
     * @param {number} weekId
     * @returns {Promise<MealPlanWeek>}
     */
    getWeek(weekId) {
        return http.get(`/meal-plans/weeks/${weekId}`);
    },

    /**
     * @param {CreateMealGroupPayload} payload
     * @returns {Promise<MealGroup>}
     */
    createMealGroup(payload) {
        return http.post("/meal-groups", payload);
    },

    /**
     * @param {number} groupId
     * @param {Partial<CreateMealGroupPayload>} payload
     * @returns {Promise<MealGroup>}
     */
    updateMealGroup(groupId, payload) {
        return http.patch(`/meal-groups/${groupId}`, payload);
    },

    /**
     * @param {number} groupId
     * @returns {Promise<{status: string}>}
     */
    deleteMealGroup(groupId) {
        return http.delete(`/meal-groups/${groupId}`);
    },

    /**
     * @param {number} groupId
     * @param {AddRecipeToGroupPayload} payload
     * @returns {Promise<MealGroupRecipe>}
     */
    addRecipeToGroup(groupId, payload) {
        return http.post(`/meal-groups/${groupId}/recipes`, payload);
    },

    /**
     * @param {number} groupRecipeId
     * @param {{plannedServings?: number, sortOrder?: number}} payload
     * @returns {Promise<MealGroupRecipe>}
     */
    updateGroupRecipe(groupRecipeId, payload) {
        return http.patch(`/meal-group-recipes/${groupRecipeId}`, payload);
    },

    /**
     * @param {number} groupRecipeId
     * @returns {Promise<{status: string}>}
     */
    deleteGroupRecipe(groupRecipeId) {
        return http.delete(`/meal-group-recipes/${groupRecipeId}`);
    },

        /**
     * @param {number} sourceWeekId
     * @param {{weekStart: string}} payload
     * @returns {Promise<MealPlanWeek>}
     */
    copyWeek(sourceWeekId, payload) {
        return http.post(`/meal-plans/weeks/${sourceWeekId}/copy`, payload);
    },

};
