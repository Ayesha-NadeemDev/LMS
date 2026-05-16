"use client";
import React, { useState, useEffect } from 'react';
import { getCurrentUser, getToken } from '@/lib/auth';

const AssignmentPage = () => {
  const initialStats = {
    total: 0,
    pending: 0,
    submitted: 0,
    graded: 0,
    overdue: 0,
    averageScore: 0
  };

  const initialAssignments = {
    pending: [],
    submitted: [],
    graded: [],
    overdue: []
  };

  const [assignmentData, setAssignmentData] = useState({
    success: true,
    stats: { ...initialStats },
    assignments: { ...initialAssignments }
  });

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    course: '',
    dueDate: '',
    status: 'pending',
    score: null,
    submittedAt: null,
    feedback: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
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

  // ========================================
  // BACKEND API CALLS
  // ========================================
  
  const fetchAssignmentsFromBackend = async (authToken) => {
    try {
      const response = await fetch('/api/student/assignments', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAssignmentData({
          success: true,
          stats: data.stats,
          assignments: data.assignments
        });
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAssignmentInBackend = async (assignmentData) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(assignmentData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return null;
    }
  };

  const updateAssignmentInBackend = async (assignmentData) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/student/assignments', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(assignmentData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      return null;
    }
  };

  const deleteAssignmentInBackend = async (assignmentId) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch(`/api/student/assignments?id=${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return null;
    }
  };

  const submitAssignmentWork = async (assignmentId, submissionText, attachmentUrl) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ assignmentId, submissionText, attachmentUrl })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return null;
    }
  };

  const gradeAssignmentInBackend = async (assignmentId, score, feedback) => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/student/assignments/grade', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ assignmentId, score, feedback })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error grading assignment:', error);
      return null;
    }
  };

  // ========================================
  // LOAD USER AND FETCH DATA ON MOUNT
  // ========================================
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      alert('Please login first');
      setIsLoading(false);
      return;
    }
    setCurrentUser(user);
    
    const token = getToken();
    if (token) {
      fetchAssignmentsFromBackend(token);
    }
  }, []);

  // ========================================
  // CRUD HANDLERS
  // ========================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      course: '',
      dueDate: '',
      status: 'pending',
      score: null,
      submittedAt: null,
      feedback: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleAddAssignment = async () => {
    if (!formData.title.trim()) {
      alert("Please enter assignment title");
      return;
    }
    if (!formData.course.trim()) {
      alert("Please enter course name");
      return;
    }
    if (!formData.dueDate) {
      alert("Please select due date");
      return;
    }

    const assignmentPayload = {
      title: formData.title,
      description: formData.description,
      course: formData.course,
      dueDate: formData.dueDate
    };

    if (isEditing && editId) {
      const result = await updateAssignmentInBackend({
        id: editId,
        ...assignmentPayload,
        status: 'pending'
      });
      
      if (result?.success) {
        const token = getToken();
        await fetchAssignmentsFromBackend(token);
        alert("Assignment updated successfully!");
        resetForm();
      } else {
        alert("Failed to update assignment");
      }
    } else {
      const result = await createAssignmentInBackend(assignmentPayload);
      
      if (result?.success) {
        const token = getToken();
        await fetchAssignmentsFromBackend(token);
        alert("Assignment added successfully!");
        resetForm();
      } else {
        alert("Failed to add assignment");
      }
    }
  };

  const handleSubmitAssignment = async (assignmentId, currentStatus) => {
    if (!confirm("Submit this assignment?")) {
      return;
    }
    
    const submissionText = `Submitted on ${new Date().toLocaleString()}`;
    
    const result = await submitAssignmentWork(assignmentId, submissionText, null);
    
    if (result?.success) {
      const token = getToken();
      await fetchAssignmentsFromBackend(token);
      alert("✓ Assignment submitted successfully!");
    } else {
      alert("❌ Submission failed: " + (result?.error || "Unknown error"));
    }
  };

  const handleGradeAssignment = async (assignmentId, score, feedback) => {
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Please enter a valid score between 0 and 100");
      return;
    }

    const result = await gradeAssignmentInBackend(assignmentId, scoreNum, feedback);
    
    if (result?.success) {
      const token = getToken();
      await fetchAssignmentsFromBackend(token);
      alert("Assignment graded successfully!");
    } else {
      alert("Failed to grade assignment");
    }
  };

  const handleDeleteAssignment = async (assignmentId, status) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const result = await deleteAssignmentInBackend(assignmentId);
      
      if (result?.success) {
        const token = getToken();
        await fetchAssignmentsFromBackend(token);
        alert("Assignment deleted successfully!");
      } else {
        alert("Failed to delete assignment");
      }
    }
  };

  const handleEditAssignment = (assignment) => {
    setIsEditing(true);
    setEditId(assignment.id);
    setFormData({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      course: assignment.course,
      dueDate: assignment.dueDate.split('T')[0],
      status: assignment.status,
      score: assignment.score,
      submittedAt: assignment.submittedAt,
      feedback: assignment.feedback
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAssignmentsToShow = () => {
    if (activeTab === 'all') {
      return {
        title: "All Assignments",
        assignments: [
          ...assignmentData.assignments.pending.map(a => ({ ...a, statusType: 'pending' })),
          ...assignmentData.assignments.submitted.map(a => ({ ...a, statusType: 'submitted' })),
          ...assignmentData.assignments.graded.map(a => ({ ...a, statusType: 'graded' })),
          ...assignmentData.assignments.overdue.map(a => ({ ...a, statusType: 'overdue' }))
        ].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
      };
    } else if (activeTab === 'pending') {
      return { title: "Pending Assignments", assignments: assignmentData.assignments.pending.map(a => ({ ...a, statusType: 'pending' })) };
    } else if (activeTab === 'submitted') {
      return { title: "Submitted Assignments", assignments: assignmentData.assignments.submitted.map(a => ({ ...a, statusType: 'submitted' })) };
    } else if (activeTab === 'graded') {
      return { title: "Graded Assignments", assignments: assignmentData.assignments.graded.map(a => ({ ...a, statusType: 'graded' })) };
    } else if (activeTab === 'overdue') {
      return { title: "Overdue Assignments", assignments: assignmentData.assignments.overdue.map(a => ({ ...a, statusType: 'overdue' })) };
    }
    return { title: "All Assignments", assignments: [] };
  };

  const { title: tabTitle, assignments: displayAssignments } = getAssignmentsToShow();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-cyan-100'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-cyan-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with User Name */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📋 Assignment Manager
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage your course assignments, {currentUser?.name?.split(' ')[0] || 'Student'}
          </p>
          
          {/* Stats Summary */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-indigo-400' : 'bg-white text-indigo-600'} shadow-sm`}>
              📊 Total: {assignmentData.stats.total}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-amber-400' : 'bg-white text-amber-600'} shadow-sm`}>
              ⏳ Pending: {assignmentData.stats.pending}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`}>
              📤 Submitted: {assignmentData.stats.submitted}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-emerald-400' : 'bg-white text-emerald-600'} shadow-sm`}>
              ✅ Graded: {assignmentData.stats.graded}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'} shadow-sm`}>
              ⚠️ Overdue: {assignmentData.stats.overdue}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${darkMode ? 'bg-gray-800 text-purple-400' : 'bg-white text-purple-600'} shadow-sm`}>
              ⭐ Avg Score: {assignmentData.stats.averageScore}%
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE - Form */}
          <div className={`rounded-xl p-5 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span>{isEditing ? '✏️' : '➕'}</span>
              {isEditing ? 'Edit Assignment' : 'Add New Assignment'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📌 Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Week 3 Assignment"
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📝 Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed assignment description..."
                  rows="2"
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📚 Course Name *
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development"
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📅 Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddAssignment}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {isEditing ? '✅ Update Assignment' : '📥 Add Assignment'}
                </button>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Assignments List */}
          <div className={`rounded-xl p-5 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'all' ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All ({assignmentData.stats.total})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'pending' ? 'bg-amber-500 text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Pending ({assignmentData.stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'submitted' ? 'bg-blue-500 text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Submitted ({assignmentData.stats.submitted})
              </button>
              <button
                onClick={() => setActiveTab('graded')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'graded' ? 'bg-emerald-500 text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Graded ({assignmentData.stats.graded})
              </button>
              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'overdue' ? 'bg-red-500 text-white' : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Overdue ({assignmentData.stats.overdue})
              </button>
            </div>

            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tabTitle}</h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              {displayAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📭</div>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No assignments found</p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Add your first assignment using the form
                  </p>
                </div>
              ) : (
                displayAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`rounded-lg p-3 border-l-4 transition hover:shadow-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} ${
                      assignment.statusType === 'pending' ? 'border-l-amber-500' :
                      assignment.statusType === 'submitted' ? 'border-l-blue-500' :
                      assignment.statusType === 'graded' ? 'border-l-emerald-500' : 'border-l-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          assignment.statusType === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          assignment.statusType === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          assignment.statusType === 'graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {assignment.statusType}
                        </span>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{assignment.title}</h4>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className={`px-2 py-1 rounded text-xs transition ${darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id, assignment.statusType)}
                          className={`px-2 py-1 rounded text-xs transition ${darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {assignment.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        📚 {assignment.course}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {assignment.submittedAt && (
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                          📤 Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                      {assignment.score && (
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                          ⭐ Score: {assignment.score}%
                        </span>
                      )}
                    </div>

                    {assignment.feedback && (
                      <div className={`text-xs p-2 rounded mb-2 ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        💬 Feedback: {assignment.feedback}
                      </div>
                    )}

                    {(assignment.statusType === 'pending' || assignment.statusType === 'overdue') && (
                      <button
                        onClick={() => handleSubmitAssignment(assignment.id, assignment.statusType)}
                        className={`mt-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      >
                        📤 Submit Assignment
                      </button>
                    )}

                    {assignment.statusType === 'submitted' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <input
                          type="number"
                          placeholder="Score (0-100)"
                          className={`w-28 px-2 py-1.5 rounded-lg text-sm border focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          id={`score-${assignment.id}`}
                        />
                        <input
                          type="text"
                          placeholder="Feedback"
                          className={`flex-1 min-w-[150px] px-2 py-1.5 rounded-lg text-sm border focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          id={`feedback-${assignment.id}`}
                        />
                        <button
                          onClick={() => {
                            const score = document.getElementById(`score-${assignment.id}`).value;
                            const feedback = document.getElementById(`feedback-${assignment.id}`).value;
                            handleGradeAssignment(assignment.id, score, feedback);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                        >
                          🎯 Grade
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#e2e8f0'};
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6366f1' : '#3b82f6'};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AssignmentPage;