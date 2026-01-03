/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number} [status]
 * @property {any} [details]
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

/**
 * @param {string} path
 * @returns {string}
 */
function buildUrl(path) {
    if (!path.startsWith("/")) {
        return `${API_BASE_URL}/${path}`;
    }
    return `${API_BASE_URL}${path}`;
}

/**
 * @param {Response} res
 * @returns {Promise<any>}
 */
async function parseJson(res) {
    const text = await res.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * @param {Response} res
 * @returns {Promise<never>}
 */
async function throwApiError(res) {
    const data = await parseJson(res);
    const message =
        (data && typeof data === "object" && (data.error || data.message)) ||
        `Request failed (${res.status})`;

    /** @type {ApiError} */
    const err = {
        message,
        status: res.status,
        details: data,
    };

    throw err;
}

/**
 * @param {"GET"|"POST"|"PATCH"|"DELETE"} method
 * @param {string} path
 * @param {any} [body]
 * @returns {Promise<any>}
 */
export async function request(method, path, body) {
    const res = await fetch(buildUrl(path), {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        await throwApiError(res);
    }

    return parseJson(res);
}

export const http = {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),
};
