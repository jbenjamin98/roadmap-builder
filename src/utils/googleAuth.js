/**
 * Google Identity Services (token model) helpers. Runs fully in the browser: there is no backend,
 * no client secret and no refresh token, so access tokens last about an hour and are renewed
 * silently when Google allows it (otherwise the UI asks the user to Reconnect).
 */

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '516877563239-klnf6ph4oi91gc05hovm9vlneko0opre.apps.googleusercontent.com';

const SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

const TOKEN_KEY = 'google_drive_token';
const EXPIRY_KEY = 'google_drive_token_expires_at';
const PROFILE_KEY = 'google_user_profile';
/** Treat a token as expired slightly early so a request never starts with a dying token. */
const EXPIRY_SKEW_MS = 60 * 1000;

/**
 * Typed failure for everything Drive-related so the UI can react to the cause.
 * Codes: not_signed_in | auth_expired | cancelled | network | not_found | forbidden | trashed | http
 */
export class DriveError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} [status]
   */
  constructor(code, message, status) {
    super(message);
    this.name = 'DriveError';
    this.code = code;
    this.status = status;
  }
}

let currentAccessToken = null;
let currentExpiry = 0;
let currentUserProfile = null;
let scriptPromise = null;

const getGoogle = () =>
  typeof window !== 'undefined' ? /** @type {any} */ (window).google : undefined;

function loadGsiScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (getGoogle()?.accounts?.oauth2) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => {
        scriptPromise = null;
        resolve(false);
      });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** The current access token, or null when there is none or it has expired. */
export function getStoredAccessToken() {
  let token = currentAccessToken;
  let expiry = currentExpiry;
  if (!token && typeof window !== 'undefined') {
    token = window.sessionStorage.getItem(TOKEN_KEY);
    expiry = Number(window.sessionStorage.getItem(EXPIRY_KEY)) || 0;
  }
  if (!token) return null;
  if (expiry && Date.now() > expiry - EXPIRY_SKEW_MS) {
    setStoredAccessToken(null);
    return null;
  }
  return token;
}

/** @param {string | null} token @param {number} [expiresInSeconds] */
export function setStoredAccessToken(token, expiresInSeconds = 3600) {
  currentAccessToken = token;
  currentExpiry = token ? Date.now() + expiresInSeconds * 1000 : 0;
  if (typeof window === 'undefined') return;
  if (token) {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(EXPIRY_KEY, String(currentExpiry));
  } else {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRY_KEY);
  }
}

export function getStoredUserProfile() {
  if (currentUserProfile) return currentUserProfile;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.sessionStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUserProfile(profile) {
  currentUserProfile = profile;
  if (typeof window === 'undefined') return;
  if (profile) window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  else window.sessionStorage.removeItem(PROFILE_KEY);
}

export async function fetchUserProfile(token) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const profile = await res.json();
    setStoredUserProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

/**
 * Requests an access token.
 * @param {{ prompt?: '' | 'none' | 'consent' | 'select_account', hint?: string }} [options]
 *   `prompt: 'none'` never shows UI and fails with `auth_expired` if Google needs the user.
 * @returns {Promise<{ token: string, profile: any }>}
 */
export async function signInWithGoogle({ prompt = '', hint } = {}) {
  const loaded = await loadGsiScript();
  const google = getGoogle();
  if (!loaded || !google?.accounts?.oauth2) {
    throw new DriveError('network', 'Google sign-in could not be loaded. Check your connection.');
  }

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (resp) => {
        if (resp.error) {
          const cancelled = resp.error === 'access_denied';
          reject(
            new DriveError(
              cancelled ? 'cancelled' : 'auth_expired',
              resp.error_description || 'Google sign-in did not complete.'
            )
          );
          return;
        }
        setStoredAccessToken(resp.access_token, Number(resp.expires_in) || 3600);
        const profile = (await fetchUserProfile(resp.access_token)) || getStoredUserProfile();
        resolve({ token: resp.access_token, profile });
      },
      // Fired when the popup is closed or blocked. Without it the promise would never settle and
      // the UI would spin forever.
      error_callback: (err) => {
        const type = err?.type || '';
        reject(
          new DriveError(
            type === 'popup_failed_to_open' ? 'network' : 'cancelled',
            type === 'popup_failed_to_open'
              ? 'Your browser blocked the Google sign-in popup. Allow popups and try again.'
              : 'Google sign-in was cancelled.'
          )
        );
      },
    });
    client.requestAccessToken({ prompt, ...(hint ? { hint } : {}) });
  });
}

export function signOutGoogle() {
  const token = getStoredAccessToken();
  const google = getGoogle();
  if (token && google?.accounts?.oauth2) {
    try {
      google.accounts.oauth2.revoke(token, () => {});
    } catch {
      // ignore
    }
  }
  setStoredAccessToken(null);
  setStoredUserProfile(null);
}
