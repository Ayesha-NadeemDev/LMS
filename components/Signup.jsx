"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Signup({ onClose, onSwitchToLogin }) {
  const router = useRouter();
  
  // ✅ Fresh state - No default values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  // ✅ Clear all form fields when modal opens
  useEffect(() => {
    // Reset all form fields
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setRole("student");
    setError("");
    setPasswordErrors({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false
    });
  }, []); // Runs once when component mounts

  const validatePassword = (pwd, confirmPwd) => {
    setPasswordErrors({
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      match: pwd === confirmPwd
    });
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);
    validatePassword(password, confirmPwd);
  };

  const isPasswordValid = () => {
    return passwordErrors.length && 
           passwordErrors.uppercase && 
           passwordErrors.lowercase && 
           passwordErrors.number && 
           passwordErrors.match;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      setError("Please meet all password requirements");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Clear ALL localStorage first
        localStorage.clear();
        
        // ✅ Save new user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('lms_current_user', JSON.stringify(data.user));
        
        onClose();
        
        // Redirect based on role
        if (data.user.role === 'student') {
          window.location.href = '/dashboard/student';
        } else if (data.user.role === 'instructor') {
          window.location.href = '/dashboard/instructor';
        } else if (data.user.role === 'admin') {
          window.location.href = '/dashboard/admin';
        }
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
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
        
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I want to join as:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === "student"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === "instructor"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                👨‍🏫 Instructor
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  role === "admin"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                👑 Admin
              </button>
            </div>
          </div>
          
          {/* Name Field - Fresh */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
          />
          
          {/* Email Field - Fresh */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
          />
          
          {/* Password Field */}
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {/* Password Requirements */}
          <div className="text-xs space-y-1 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Password must contain:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={passwordErrors.length ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                {passwordErrors.length ? "✓" : "✗"} Min 6 characters
              </div>
              <div className={passwordErrors.uppercase ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                {passwordErrors.uppercase ? "✓" : "✗"} Uppercase letter
              </div>
              <div className={passwordErrors.lowercase ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                {passwordErrors.lowercase ? "✓" : "✗"} Lowercase letter
              </div>
              <div className={passwordErrors.number ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                {passwordErrors.number ? "✓" : "✗"} Number
              </div>
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div className="relative mb-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {/* Password Match Message */}
          {confirmPassword && passwordErrors.match && (
            <div className="text-green-600 dark:text-green-400 text-xs mb-3">
              ✓ Passwords match
            </div>
          )}
          
          {confirmPassword && !passwordErrors.match && (
            <div className="text-red-500 dark:text-red-400 text-xs mb-3">
              ✗ Passwords do not match
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || (password && !isPasswordValid())}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              `Sign up as ${role.charAt(0).toUpperCase() + role.slice(1)}`
            )}
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button 
            onClick={onSwitchToLogin} 
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}