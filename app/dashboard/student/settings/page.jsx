"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getToken } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    avatar: '👨‍🎓'
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'English'
  });

  // ✅ Save profile to localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem('user_profile', JSON.stringify(data));
    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.name = data.name;
      localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
    }
  };

  // ✅ Fetch REAL user data from API
  const fetchRealUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/');
        return;
      }
      
      const currentUser = getCurrentUser();
      if (currentUser) {
        const realProfile = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          avatar: '👨‍🎓',
          bio: profile?.bio || 'Passionate learner',
          phone: profile?.phone || '',
          location: profile?.location || '',
          joinDate: new Date().toISOString().split('T')[0],
          preferences: preferences
        };
        
        setProfile(realProfile);
        setProfileForm({
          name: currentUser.name || '',
          bio: profile?.bio || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          avatar: '👨‍🎓'
        });
      }
      
      // Fetch settings from settings API
      const settingsRes = await fetch('/api/student/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.success && settingsData.profile) {
        setProfileForm(prev => ({
          ...prev,
          bio: settingsData.profile.bio || prev.bio,
          phone: settingsData.profile.phone || prev.phone,
          location: settingsData.profile.location || prev.location
        }));
        setPreferences(settingsData.profile.preferences || preferences);
      }
      
    } catch (error) {
      console.error('Error fetching user:', error);
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setProfileForm({
          name: parsed.name || '',
          bio: parsed.bio || '',
          phone: parsed.phone || '',
          location: parsed.location || '',
          avatar: parsed.avatar || '👨‍🎓'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealUserData();
  }, []);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = getToken();
      const res = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'profile', data: profileForm })
      });
      
      const data = await res.json();
      if (data.success) {
        const updatedProfile = { ...profile, ...profileForm };
        setProfile(updatedProfile);
        
        const currentUser = getCurrentUser();
        if (currentUser) {
          currentUser.name = profileForm.name;
          localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
        }
        
        saveToLocalStorage(updatedProfile);
        
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setSaving(true);
    
    try {
      const token = getToken();
      const res = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          type: 'password', 
          data: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async () => {
    setSaving(true);
    
    try {
      const token = getToken();
      const res = await fetch('/api/student/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'preferences', data: preferences })
      });
      
      const data = await res.json();
      if (data.success) {
        const updatedProfile = { ...profile, preferences: preferences };
        setProfile(updatedProfile);
        saveToLocalStorage(updatedProfile);
        
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ⚙️ Account Settings
        </h1>
        
        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Profile Card */}
        <div className={`rounded-xl border shadow-sm overflow-hidden mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {profile?.avatar || '👨‍🎓'}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">{profile?.name || 'Student'}</h2>
                <p className="text-indigo-100 text-sm">{profile?.email || 'student@example.com'}</p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className={`border-b px-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-1 font-medium text-sm transition ${
                  activeTab === 'profile' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-3 px-1 font-medium text-sm transition ${
                  activeTab === 'preferences' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Preferences
              </button>
            </div>
          </div>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className={`w-full border rounded-lg px-4 py-2 cursor-not-allowed ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 text-gray-500'}`}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email cannot be changed</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Change Password
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              
              {/* Password Change Form */}
              {showPasswordForm && (
                <div className={`mt-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                  <form onSubmit={handleUpdatePassword}>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                      />
                      <input
                        type="password"
                        placeholder="New Password (min 6 characters)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Email Notifications</span>
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={preferences.emailNotifications}
                        onChange={handlePreferenceChange}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Push Notifications</span>
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={preferences.pushNotifications}
                        onChange={handlePreferenceChange}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Language</h3>
                  <select
                    name="language"
                    value={preferences.language}
                    onChange={handlePreferenceChange}
                    className={`w-full md:w-64 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleUpdatePreferences}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Account Info Card */}
        <div className={`rounded-xl border shadow-sm p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Member Since</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{profile?.joinDate || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Account Status</span>
              <span className="text-green-600 dark:text-green-400">Active ✅</span>
            </div>
            <div className="flex justify-between py-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Account Type</span>
              <span className={`capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{profile?.role || 'Student'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}