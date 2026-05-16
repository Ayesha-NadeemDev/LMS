"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, ShieldCheck } from "lucide-react";

import Signup from "@/components/Signup";
import Login from "@/components/Login";

export default function Home() {
  const router = useRouter();
  
  const roles = [
    {
      role: "student",  
      icon: GraduationCap,
      label: "Student",
      desc: "Access courses and learn",
    },
    {
      role: "instructor",
      icon: Users,
      label: "Instructor",
      desc: "Create and manage courses",
    },
    {
      role: "admin",
      icon: ShieldCheck,
      label: "Admin",
      desc: "Manage the platform",
    },
  ];

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const loggedInUser = localStorage.getItem("lms_current_user");
    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        setCurrentUser(user);
        console.log("User already logged in:", user);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  const toggleAuth = () => {
    if (showLogin) {
      setShowLogin(false);
      setShowSignup(true);
    } else {
      setShowSignup(false);
      setShowLogin(true);
    }
  };

  // Handle successful login/signup
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setShowLogin(false);
    setShowSignup(false);
    // Optional: Auto-redirect to their dashboard
    // router.push(`/dashboard/${userData.role}`);
  };

  // Handle portal click - check authentication first
  const handlePortalClick = (role) => {
    console.log("=== DEBUG START ===");
    console.log("Clicked role:", role);
    
    // Try multiple possible localStorage keys
    let loggedInUser = localStorage.getItem("lms_current_user");
    
    // Try alternative keys if not found
    if (!loggedInUser) {
      loggedInUser = localStorage.getItem("user");
      console.log("Tried 'user' key instead");
    }
    if (!loggedInUser) {
      loggedInUser = localStorage.getItem("currentUser");
      console.log("Tried 'currentUser' key instead");
    }
    
    console.log("Raw localStorage data:", loggedInUser);
    
    if (!loggedInUser) {
      console.log("No user found in localStorage");
      alert("Please login or signup first to access the portal");
      setShowLogin(true);
      return;
    }
    
    try {
      const user = JSON.parse(loggedInUser);
      console.log("Parsed user object:", user);
      console.log("User role from storage:", user.role);
      console.log("Required role:", role);
      console.log("Do roles match?", user.role === role);
      
      // Case-insensitive role comparison
      if (user.role.toLowerCase() !== role.toLowerCase()) {
        alert(`Access denied! You are logged in as ${user.role}, not as ${role}.`);
        return;
      }
      
      console.log("✅ ABOUT TO REDIRECT TO:", `/dashboard/${role.toLowerCase()}`);
      
      // Try router.push first
      try {
        router.push(`/dashboard/${role.toLowerCase()}`);
        console.log("router.push executed successfully");
      } catch (routerError) {
        console.error("router.push failed:", routerError);
        // Fallback to window.location
        window.location.href = `/dashboard/${role.toLowerCase()}`;
      }
      
    } catch (error) {
      console.error("Error parsing user:", error);
      alert("Error reading user data. Please login again.");
      // Clear corrupted data
      localStorage.removeItem("lms_current_user");
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
    
    console.log("=== DEBUG END ===");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center mb-6 shadow-lg">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Welcome to EduHub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Your Learning Management System
          </p>
          
          {/* Show logged in user info */}
          {currentUser && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg inline-block">
              <p className="text-green-700 dark:text-green-300">
                ✅ Logged in as: <strong>{currentUser.role}</strong> 
                {currentUser.name && ` (${currentUser.name})`}
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("lms_current_user");
                  localStorage.removeItem("user");
                  localStorage.removeItem("currentUser");
                  setCurrentUser(null);
                  alert("Logged out successfully!");
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Logout
              </button>
            </div>
          )}
          
          <div className="my-5 flex flex-col items-center justify-center">
            {/* Button Group - Hide if logged in */}
            {!currentUser && (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Modals - Pass success callback */}
            {showLogin && (
              <Login 
                onClose={() => setShowLogin(false)} 
                onSwitchToSignup={toggleAuth}
                onLoginSuccess={handleAuthSuccess}
              />
            )}
            {showSignup && (
              <Signup 
                onClose={() => setShowSignup(false)} 
                onSwitchToLogin={toggleAuth}
                onSignupSuccess={handleAuthSuccess}
              />
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            {currentUser 
              ? `Click on your portal (${currentUser.role}) to access dashboard` 
              : "New user? Sign up first, then login to access your portal"}
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => handlePortalClick(r.role)}
              className={`group p-6 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${
                currentUser?.role === r.role
                  ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <r.icon size={22} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{r.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{r.desc}</p>
              {currentUser?.role === r.role && (
                <p className="text-xs text-primary-600 mt-2">✓ Your current role</p>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Only registered users can access portals. Login required.</p>
        </div>
      </div>
    </div>
  );
}