/**
 * SESSION MANAGEMENT
 * Handles user session state using localStorage
 * This maintains user identity across page navigation
 */

const SESSION_KEY = 'eBarangaySession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Session structure
/*
{
  userType: 'admin' | 'bhw',
  userId: string,
  userName: string,
  loginTime: timestamp,
  expiresAt: timestamp,
  // BHW specific
  firstName?: string,
  lastName?: string,
  middleInitial?: string,
  contact?: string,
  // Admin specific
  adminUsername?: string
}
*/

/**
 * Create a new session
 */
function createSession(userData) {
  const session = {
    ...userData,
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Get current session
 */
function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (e) {
    clearSession();
    return null;
  }
}

/**
 * Clear current session (logout)
 */
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
  const session = getSession();
  return session && session.userType === 'admin';
}

/**
 * Check if current user is BHW
 */
function isBHW() {
  const session = getSession();
  return session && session.userType === 'bhw';
}

/**
 * Get current user display name
 */
function getCurrentUserName() {
  const session = getSession();
  if (!session) return 'Guest';
  
  if (session.userType === 'admin') {
    return 'System Administrator';
  } else if (session.userType === 'bhw') {
    const middleInitial = session.middleInitial ? `${session.middleInitial}. ` : '';
    return `${session.firstName} ${middleInitial}${session.lastName}`;
  }
  
  return 'Guest';
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
  const session = getSession();
  return session ? session.userId : null;
}

/**
 * Update session expiry (extend session)
 */
function extendSession() {
  const session = getSession();
  if (session) {
    session.expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get session remaining time in minutes
 */
function getSessionTimeRemaining() {
  const session = getSession();
  if (!session) return 0;
  
  const remaining = session.expiresAt - Date.now();
  return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
}

/**
 * Validate session and redirect if needed
 */
function validateSession(requiredUserType = null) {
  const session = getSession();
  
  if (!session) {
    // No session, redirect to login
    window.location.href = 'login.html';
    return false;
  }
  
  if (requiredUserType && session.userType !== requiredUserType) {
    // Wrong user type for this page
    if (requiredUserType === 'admin') {
      window.location.href = 'dashboard.html'; // BHW trying to access admin
    } else {
      window.location.href = 'admin.html'; // Admin trying to access BHW dashboard
    }
    return false;
  }
  
  return true;
}