import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth.service.js";

/**
 * @typedef {{ id: number, username: string }} AuthUser
 * @typedef {{
 *   user: AuthUser | null,
 *   loading: boolean,
 *   refresh: () => Promise<void>,
 *   login: (username: string, password: string) => Promise<AuthUser>,
 *   signup: (username: string, password: string) => Promise<AuthUser>,
 *   logout: () => Promise<void>
 * }} AuthContextValue
 */

const AuthContext = createContext(null);

/**
 * @param {{ children: import("react").ReactNode }} props
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function refresh() {
        setLoading(true);
        try {
            const res = await authService.me();

            // Supports either:
            // - { authenticated: true, user: {...} }
            // - { id, username }
            if (res?.authenticated === false) {
                setUser(null);
            } else if (res?.user) {
                setUser(res.user);
            } else {
                setUser(res);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    async function login(username, password) {
        const u = await authService.login({ username, password });
        setUser(u);
        return u;
    }

    async function signup(username, password) {
        const u = await authService.signup({ username, password });
        setUser(u);
        return u;
    }

    async function logout() {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    }

    /** @type {AuthContextValue} */
    const value = useMemo(
        () => ({
            user,
            loading,
            refresh,
            login,
            signup,
            logout,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {AuthContextValue} */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
