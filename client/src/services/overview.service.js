import { http } from "./http.js";

export const overviewService = {
    today() {
        return http.get("/overview/today");
    },
};
