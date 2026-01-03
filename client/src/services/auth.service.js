import { http } from "./http.js";

/**
 * @typedef {{ id: number, username: string }} AuthUser
 */

export const authService = {
    /**
     * @param {{ username: string, password: string }} payload
     * @returns {Promise<AuthUser>}
     */
    signup(payload) {
        return http.post("/auth/signup", payload);
    },

    /**
     * @param {{ username: string, password: string }} payload
     * @returns {Promise<AuthUser>}
     */
    login(payload) {
        return http.post("/auth/login", payload);
    },

    /**
     * @returns {Promise<{ authenticated?: boolean, user?: AuthUser } | AuthUser>}
     */
    me() {
        return http.get("/auth/me");
    },

    /**
     * @returns {Promise<{ status: string }>}
     */
    logout() {
        return http.delete("/auth/logout");
    },
};
