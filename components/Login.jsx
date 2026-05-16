"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login({ onClose, onSwitchToSignup }) {
  const router = useRouter();
  
  // ✅ Fresh state - No default values, no auto-fill
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ✅ Clear all form fields when modal opens
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
    setEmailError("");
    setPasswordError("");
  }, []); // Runs once when component mounts

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (pwd) => {
    if (!pwd) {
      setPasswordError("");
    } else if (pwd.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const isFormValid = () => {
    return email && password && !emailError && !passwordError && password.length >= 6;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please fix validation errors");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ CLEAR ALL OLD LOCALSTORAGE DATA FIRST
        localStorage.clear();
        
        // ✅ THEN SAVE NEW USER DATA
        localStorage.setItem('token', data.token);
        localStorage.setItem('lms_current_user', JSON.stringify(data.user));
        
        // ✅ CLOSE MODAL
        onClose();
        
        // ✅ REDIRECT BASED ON ROLE
        if (data.user.role === 'student') {
          window.location.href = '/dashboard/student';
        } else if (data.user.role === 'instructor') {
          window.location.href = '/dashboard/instructor';
        } else if (data.user.role === 'admin') {
          window.location.href = '/dashboard/admin';
        }
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative shadow-xl transition-all duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
              className={`w-full p-3 border rounded-lg transition-colors ${
                emailError 
                  ? "border-red-500 dark:border-red-500" 
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              required
              autoComplete="off"
            />
            {emailError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{emailError}</p>}
          </div>
          
          <div className="mb-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full p-3 border rounded-lg transition-colors ${
                  passwordError 
                    ? "border-red-500 dark:border-red-500" 
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{passwordError}</p>}
          </div>
          
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button 
            onClick={onSwitchToSignup} 
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}