"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings, Globe, Save, CheckCircle, AlertCircle, Moon, Sun, Monitor,
  ChevronRight, Check, User as UserIcon
} from 'lucide-react';

const AdminSettings = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  // ✅ THEME FIX: Listen for theme changes from navbar/storage
  useEffect(() => {
    setIsMounted(true);
    
    // Function to update theme from storage or system
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      let newTheme = savedTheme;
      
      if (!savedTheme || savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        newTheme = prefersDark ? 'dark' : 'light';
      }
      
      setTheme(newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    updateTheme();
    window.addEventListener('storage', updateTheme);
    window.addEventListener('themeChange', updateTheme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'system' || !savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    
    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('themeChange', updateTheme);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/current-user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUser();
  }, [router]);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LMS Platform',
    siteTagline: 'Learn Anything, Anytime, Anywhere',
    siteEmail: 'admin@lmsplatform.com',
    supportEmail: 'support@lmsplatform.com',
    contactPhone: '+1 (555) 123-4567',
    contactAddress: '123 Learning Street, Education City, EC 12345',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    currency: 'USD',
    currencySymbol: '$',
    registrationEnabled: true,
    emailVerification: true,
    aboutUs: 'We are a leading online learning platform dedicated to providing quality education to students worldwide.'
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
    accentColor: '#8b5cf6',
    logo: 'https://ui-avatars.com/api/?name=LMS&background=6366f1&color=fff',
    favicon: 'https://ui-avatars.com/api/?name=L&background=6366f1&color=fff&size=32',
    loginBackground: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop',
    customCSS: '',
    customJS: ''
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem('admin_settings_general', JSON.stringify(generalSettings));
    localStorage.setItem('admin_settings_appearance', JSON.stringify(appearanceSettings));
    
    setSaveStatus('success');
    showToast('Settings saved successfully!', 'success');
    setTimeout(() => setSaveStatus(null), 2000);
    setSaving(false);
  };

  // ✅ Theme change handler that syncs with navbar
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    window.dispatchEvent(new Event('themeChange'));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your LMS platform settings</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* General Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h2>
          
          {/* Admin Profile Section */}
          <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              Admin Profile (Logged-in User)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Name</label>
                <input
                  type="text"
                  value={currentUser?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50"
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white bg-gray-50"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
              <input
                type="text"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Tagline</label>
              <input
                type="text"
                value={generalSettings.siteTagline}
                onChange={(e) => setGeneralSettings({...generalSettings, siteTagline: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Email</label>
              <input
                type="email"
                value={generalSettings.siteEmail}
                onChange={(e) => setGeneralSettings({...generalSettings, siteEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
              <input
                type="email"
                value={generalSettings.supportEmail}
                onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={generalSettings.contactPhone}
                onChange={(e) => setGeneralSettings({...generalSettings, contactPhone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Address</label>
              <input
                type="text"
                value={generalSettings.contactAddress}
                onChange={(e) => setGeneralSettings({...generalSettings, contactAddress: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Dubai">Dubai</option>
                <option value="Asia/Kolkata">India</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
              <select
                value={generalSettings.dateFormat}
                onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select
                value={generalSettings.language}
                onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select
                value={generalSettings.currency}
                onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Us</label>
            <textarea
              value={generalSettings.aboutUs}
              onChange={(e) => setGeneralSettings({...generalSettings, aboutUs: e.target.value})}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generalSettings.registrationEnabled}
                onChange={(e) => setGeneralSettings({...generalSettings, registrationEnabled: e.target.checked})}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Enable User Registration</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generalSettings.emailVerification}
                onChange={(e) => setGeneralSettings({...generalSettings, emailVerification: e.target.checked})}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Require Email Verification</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;