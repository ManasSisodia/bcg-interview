/**
 * services/authService.js
 * -----------------------
 * Handles all authentication-related API calls.
 *
 * Methods:
 *   login(username, password)  — POST /auth/login/
 *   logout()                   — clears local tokens
 *   getUser()                  — reads user from localStorage
 *   isAuthenticated()          — checks for valid token
 */
import api from './api';

const authService = {
  /**
   * Login with username and password.
   * Stores JWT tokens + user info in localStorage.
   * @returns {Object} user — { id, username, email, role }
   */
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    const { tokens, user } = response.data;

    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  /**
   * Clear all auth data from localStorage.
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get the current user object from localStorage.
   * @returns {Object|null}
   */
  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Check if a valid token exists.
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
