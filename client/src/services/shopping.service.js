import { http } from "./http.js";

/**
 * @typedef {Object} ShoppingListItem
 * @property {string} name
 * @property {string|null} unit
 * @property {number} quantity
 */

/**
 * @typedef {Object} ShoppingListResponse
 * @property {number} weekId
 * @property {ShoppingListItem[]} items
 */

export const shoppingService = {
    /**
     * @param {number} weekId
     * @returns {Promise<ShoppingListResponse>}
     */
    getForWeek(weekId) {
        return http.get(`/shopping-lists?weekId=${weekId}`);
    },
};
