"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings, User, Bell, Shield, CreditCard, Palette, Globe,
  Eye, EyeOff, Save, CheckCircle, AlertCircle, Camera, Moon, Sun, Monitor,
  DollarSign, Trash2, ChevronRight, Linkedin, Twitter, Github, Facebook,
  Volume2, VolumeX, Lock, X, Users, FileText, MessageSquare
} from 'lucide-react';

const InstructorSettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [previewFontSize, setPreviewFontSize] = useState('medium');

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('lms_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [formData, setFormData] = useState({
    fullName: '', email: '', username: '', bio: '', title: '', location: '', website: '', phone: '',
    emailNotifications: {
      newEnrollment: true, courseReviews: true, newMessages: true,
      studentQuestions: true, assignmentSubmissions: true, platformUpdates: false, marketingEmails: false
    },
    currentPassword: '', newPassword: '', confirmPassword: '',
    sidebarCollapsed: false, fontSize: 'medium', animations: true, reducedMotion: false, highContrast: false,
    payoutMethod: 'bank_transfer', bankAccount: '', taxId: '', payoutThreshold: 100,
    profileVisibility: 'public', showEmailToStudents: true, allowDirectMessages: true, showStudentProgress: true,
    linkedin: '', twitter: '', github: '', facebook: ''
  });

  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lms_theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      const response = await fetch('/api/instructor/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const settings = data.settings;
        setFormData(prev => ({
          ...prev,
          fullName: settings.profile?.fullName || '',
          email: settings.profile?.email || '',
          username: settings.profile?.username || '',
          bio: settings.profile?.bio || '',
          title: settings.profile?.title || '',
          location: settings.profile?.location || '',
          website: settings.profile?.website || '',
          phone: settings.profile?.phone || '',
          emailNotifications: settings.notifications || prev.emailNotifications,
          fontSize: settings.appearance?.fontSize || 'medium',
          animations: settings.appearance?.animations !== false,
          reducedMotion: settings.appearance?.reducedMotion || false,
          highContrast: settings.appearance?.highContrast || false,
          payoutMethod: settings.billing?.payoutMethod || 'bank_transfer',
          bankAccount: settings.billing?.bankAccount || '',
          taxId: settings.billing?.taxId || '',
          payoutThreshold: settings.billing?.payoutThreshold || 100,
          linkedin: settings.integrations?.linkedin || '',
          twitter: settings.integrations?.twitter || '',
          github: settings.integrations?.github || '',
          facebook: settings.integrations?.facebook || ''
        }));
        setProfileImage(settings.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.profile?.fullName || 'User')}&background=6366f1&color=fff&size=128`);
        setCoverImage(settings.profile?.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=300&fit=crop');
        setPreviewFontSize(settings.appearance?.fontSize || 'medium');
        setNotificationSound(settings.notifications?.notificationSound !== false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (type, data) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/instructor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type, data })
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleSaveProfile = () => {
    handleSave('profile', {
      fullName: formData.fullName, email: formData.email, username: formData.username,
      bio: formData.bio, title: formData.title, location: formData.location,
      website: formData.website, phone: formData.phone
    });
  };

  const handleSaveNotifications = () => {
    handleSave('notifications', { ...formData.emailNotifications, notificationSound });
  };

  const handleSaveAppearance = () => {
    handleSave('appearance', {
      fontSize: previewFontSize, animations: formData.animations,
      reducedMotion: formData.reducedMotion, highContrast: formData.highContrast
    });
  };

  const handleSaveBilling = () => {
    handleSave('billing', {
      payoutMethod: formData.payoutMethod, bankAccount: formData.bankAccount,
      taxId: formData.taxId, payoutThreshold: formData.payoutThreshold
    });
  };

  const handleSaveIntegrations = () => {
    handleSave('integrations', {
      linkedin: formData.linkedin, twitter: formData.twitter,
      github: formData.github, facebook: formData.facebook
    });
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/instructor/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      });
      setSaveStatus('success');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      alert('Something went wrong');
      setSaveStatus(null);
    }
  };

  const handleImageUpload = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result;
        if (type === 'profile') setProfileImage(imageUrl);
        else setCoverImage(imageUrl);
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/instructor/settings/upload', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type, imageUrl })
          });
        } catch (error) { console.error('Upload failed:', error); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/instructor/settings/account', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      localStorage.removeItem('token');
      localStorage.removeItem('lms_current_user');
      router.push('/');
    } catch (error) { console.error('Delete account failed:', error); }
  };

  const getFontSizeClass = () => {
    const sizes = { small: 'text-sm', medium: 'text-base', large: 'text-lg' };
    return sizes[previewFontSize] || sizes.medium;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 ${getFontSizeClass()}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {saveStatus === 'success' && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">This action cannot be undone. This will permanently delete your account.</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please type <span className="text-red-600 font-bold">DELETE MY ACCOUNT</span> to confirm:
              </p>
              <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="DELETE MY ACCOUNT" />
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Delete Forever</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sticky top-24">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all mb-1 ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <tab.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="flex-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <label className="absolute bottom-4 right-4 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('cover', e)} />
                    <div className="px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Change Cover
                    </div>
                  </label>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end -mt-12 mb-4">
                    <div className="relative">
                      <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover" />
                      <label className="absolute bottom-0 right-0 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('profile', e)} />
                        <div className="p-1 bg-indigo-600 rounded-full text-white"><Camera className="w-4 h-4" /></div>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input type="text" value={formData.fullName} onChange={(e) => handleInputChange(null, 'fullName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                      <input type="text" value={formData.username} onChange={(e) => handleInputChange(null, 'username', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => handleInputChange(null, 'email', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                      <input type="text" value={formData.title} onChange={(e) => handleInputChange(null, 'title', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input type="text" value={formData.location} onChange={(e) => handleInputChange(null, 'location', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea rows={4} value={formData.bio} onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                      <input type="url" value={formData.website} onChange={(e) => handleInputChange(null, 'website', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <button onClick={handleSaveProfile} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'newEnrollment', label: 'New Student Enrollment' },
                  { key: 'courseReviews', label: 'Course Reviews' },
                  { key: 'newMessages', label: 'New Messages' },
                  { key: 'studentQuestions', label: 'Student Questions' },
                  { key: 'assignmentSubmissions', label: 'Assignment Submissions' },
                  { key: 'platformUpdates', label: 'Platform Updates' },
                  { key: 'marketingEmails', label: 'Marketing Emails' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b">
                    <div><p className="font-medium">{item.label}</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.emailNotifications[item.key]}
                        onChange={(e) => handleInputChange('emailNotifications', item.key, e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">Notification Sound</p></div>
                  <button onClick={() => setNotificationSound(!notificationSound)} className="p-2 rounded-lg bg-gray-100">
                    {notificationSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button onClick={handleSaveNotifications} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Notifications
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="flex-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.currentPassword}
                        onChange={(e) => handleInputChange(null, 'currentPassword', e.target.value)}
                        className="w-full px-4 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:text-white" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" value={formData.newPassword} onChange={(e) => handleInputChange(null, 'newPassword', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                        onChange={(e) => handleInputChange(null, 'confirmPassword', e.target.value)}
                        className="w-full px-4 py-2 pr-10 border rounded-lg dark:bg-gray-700 dark:text-white" />
                      <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <button onClick={handleChangePassword} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Theme Preferences</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor }
                ].map((opt) => (
                  <button key={opt.id} onClick={() => setTheme(opt.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === opt.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50' : 'border-gray-200'}`}>
                    <div className="flex flex-col items-center">
                      <opt.icon className="w-6 h-6 mb-2" />
                      <p className="font-medium">{opt.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button onClick={handleSaveAppearance} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Appearance
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Payout Settings</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Payout Method</label>
                  <select value={formData.payoutMethod} onChange={(e) => handleInputChange(null, 'payoutMethod', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="bank_transfer">Bank Transfer</option><option value="paypal">PayPal</option><option value="stripe">Stripe</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Bank Account</label>
                  <input type="text" value={formData.bankAccount} onChange={(e) => handleInputChange(null, 'bankAccount', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div><label className="block text-sm font-medium mb-1">Tax ID</label>
                  <input type="text" value={formData.taxId} onChange={(e) => handleInputChange(null, 'taxId', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div><label className="block text-sm font-medium mb-1">Payout Threshold ($)</label>
                  <input type="number" value={formData.payoutThreshold} onChange={(e) => handleInputChange(null, 'payoutThreshold', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button onClick={handleSaveBilling} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Billing
                </button>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Connected Accounts</h2>
              <div className="space-y-4">
                {[
                  { name: 'LinkedIn', icon: Linkedin, field: 'linkedin', value: formData.linkedin },
                  { name: 'Twitter', icon: Twitter, field: 'twitter', value: formData.twitter },
                  { name: 'GitHub', icon: Github, field: 'github', value: formData.github },
                  { name: 'Facebook', icon: Facebook, field: 'facebook', value: formData.facebook }
                ].map((social) => (
                  <div key={social.name} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-lg bg-gray-100"><social.icon className="w-5 h-5" /></div>
                    <div className="flex-1"><p className="font-medium">{social.name}</p>
                      <input type="url" value={social.value} onChange={(e) => handleInputChange(null, social.field, e.target.value)}
                        placeholder={`https://${social.name.toLowerCase()}.com/username`}
                        className="w-full text-sm border rounded-lg px-3 py-1 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button onClick={handleSaveIntegrations} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Integrations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorSettingsPage;