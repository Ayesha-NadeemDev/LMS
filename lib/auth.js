// lib/auth.js
export const getCurrentUser = () => {
  try {
    // Wait for component to mount
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('lms_current_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

// ✅ FIXED LOGOUT FUNCTION - Clear everything
export const logout = () => {
  if (typeof window === 'undefined') return;
  
  // Clear all auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('lms_current_user');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('lms_enrolled_courses');
  
  // Optional: Clear everything (uncomment if needed)
  // localStorage.clear();
  
  // Redirect to home page
  window.location.href = '/';
};