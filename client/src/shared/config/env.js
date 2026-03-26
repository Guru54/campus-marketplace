/**
 * Environment Configuration
 * Centralized environment variables with fallback defaults
 */

export const env = {
  // API
  // Prefer VITE_API_URL (set in client/.env). If provided without path, append `/api/v1`.
  API_BASE_URL: (() => {
    const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_BASE_URL;
    if (!raw) return 'http://localhost:5000/api/v1';
    return raw.endsWith('/api') || raw.endsWith('/api/v1') ? raw.replace(/\/?$/, '') : raw.replace(/\/?$/, '') + '/api/v1';
  })(),

  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Campus Marketplace',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Buy & sell items within your college community',

  // Feature flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_DEBUG === 'true',

  // Limits
  LISTINGS_PER_PAGE: 9,
  CHATS_PER_PAGE: 10,
  MESSAGES_PER_PAGE: 30,

  // Timeouts
  API_TIMEOUT: 30000,
  SOCKET_RECONNECT_DELAY: 5000,

  // Storage keys
  STORAGE_KEYS: {
    USER: 'rezell_user',
    THEME: 'rezell_theme',
    DRAFT: 'rezell_draft',
  },

  // URLs
  URLS: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    LISTINGS: '/listings',
    CHATS: '/chats',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
};

export default env;
