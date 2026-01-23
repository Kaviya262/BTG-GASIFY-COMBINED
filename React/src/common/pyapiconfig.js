// Production URL - Reads from .env and ensures no trailing slash
//const rawUrl = process.env.REACT_APP_PYTHON_API_URL || "https://beta.spairyx.com/pyapi";
const rawUrl = "http://127.0.0.1:8000";
// console.log("DEBUG: Configured PYTHON_API_URL:", rawUrl); 
export const PYTHON_API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;