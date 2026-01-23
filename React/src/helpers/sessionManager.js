import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { setToken } from "helpers/jwt-token-access/accessToken";

let timer = null;
let isRefreshing = false;

/**
 * Start or restart session timer
 */
export const startSessionTimer = (token, refreshToken, logout) => {
    if (!token || !refreshToken) {
        forceLogout(logout);
        return;
    }

    try {
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000;

        // Refresh 10 seconds before expiry for 1-minute token
        const delay = expiresAt - Date.now() - 5000;

        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            refreshSession(token, refreshToken, logout);
        }, Math.max(delay, 0));
    } catch {
        // Token corrupted → attempt refresh once
        refreshSession(token, refreshToken, logout);
    }
};

/**
 * Call refresh-token API
 */
const refreshSession = async (token, refreshToken, logout) => {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
        const res = await axios.post("/api/Authenticate/refresh-token", {
            accessToken: token,
            refreshToken: refreshToken,
        });

        if (res?.data?.status === true && res.data.data?.accessToken) {
            const newAccessToken = res.data.data.accessToken;
            const newRefreshToken = res.data.data.refreshToken;

            // Store tokens
            setToken({
                token: newAccessToken,
                refreshToken: newRefreshToken,
            });

            isRefreshing = false;

            // Restart timer with new token
            startSessionTimer(newAccessToken, newRefreshToken, logout);
            return;
        }

        // Refresh token expired / invalid
        forceLogout(logout);
    } catch (error) {
        // API failed / network issue
        forceLogout(logout);
    }
};

/**
 * Force logout (single exit point)
 */
const forceLogout = (logout) => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    isRefreshing = false;

    // Clear stored tokens
    setToken({
        token: null,
        refreshToken: null,
    });

    logout(); // 🔥 guaranteed logout
};

/**
 * Clear timer manually (on logout / app unmount)
 */
export const clearSessionTimer = () => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};
