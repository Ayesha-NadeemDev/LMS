"use client";
import { useEffect, useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { getCurrentUser, getToken } from '@/lib/auth';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const certificateRef = useRef(null);

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

  // Fetch certificates for logged-in user
  useEffect(() => {
    const fetchCertificates = async () => {
      const user = getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);
      
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/student/certificates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setCertificates(data.certificates);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, []);

  // ✅ DOWNLOAD as PNG
  const handleDownloadPNG = async () => {
    if (certificateRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(certificateRef.current, {
          quality: 1,
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `${selectedCert?.title.replace(/\s/g, '_')}_Certificate.png`;
        link.href = dataUrl;
        link.click();
        alert('✅ Certificate downloaded as PNG!');
      } catch (error) {
        console.error('Error generating PNG:', error);
        alert('Failed to generate certificate');
      }
    }
  };

  // ✅ SHARE
  const handleShare = async (cert) => {
    const shareData = {
      title: `Certificate - ${cert.title}`,
      text: `I've successfully completed ${cert.title} with grade ${cert.grade}! 🎓 - ${currentUser?.name || 'Student'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        alert('🎉 Shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\nCertificate ID: ${cert.id}`);
        alert('📋 Copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleViewDetails = (cert) => {
    setSelectedCert(cert);
  };

  const closeModal = () => {
    setSelectedCert(null);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with User Name */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎓 My Certificates
          </h1>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome, {currentUser?.name?.split(' ')[0] || 'Student'}! Here are your earned certificates.
          </p>
        </div>
        
        {certificates.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="text-7xl mb-4">📜</div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              No Certificates Yet
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              Complete courses to earn certificates!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/student/courses'}
              className={`mt-6 px-6 py-2.5 rounded-xl font-medium transition ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            <p className={`mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned by you
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, index) => (
                <div 
                  key={cert.id} 
                  className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
                  onClick={() => handleViewDetails(cert)}
                >
                  <div className="text-5xl mb-4">🏅</div>
                  <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                      {cert.grade}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                      {cert.score}%
                    </span>
                  </div>
                  <p className={`text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Issued: {cert.issueDate}
                  </p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(cert);
                      }}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(cert);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium transition"
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-2xl w-full mx-auto overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-xl">Certificate Preview</h2>
              <button onClick={closeModal} className="text-white text-2xl hover:text-gray-200 transition">✕</button>
            </div>
            
            <div className="p-6">
              {/* Certificate Design */}
              <div 
                ref={certificateRef}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border-8 border-double border-amber-500 shadow-2xl"
                style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
              >
                <div className="text-6xl mb-4">🏅 🎓 🏅</div>
                <h1 className="text-3xl font-bold text-amber-800 uppercase tracking-wide">
                  Certificate of Completion
                </h1>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto my-4"></div>
                <p className="text-gray-600 mt-4">This certificate is proudly presented to</p>
                <p className="text-2xl font-bold text-indigo-700 my-3">
                  {currentUser?.name || selectedCert.studentName || "Student"}
                </p>
                <p className="text-gray-600">for successfully completing the course</p>
                <p className="text-xl font-semibold text-purple-700 my-3">
                  {selectedCert.title}
                </p>
                
                <div className="flex justify-center gap-8 my-6 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-500">GRADE</p>
                    <p className="text-xl font-bold text-green-600">{selectedCert.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SCORE</p>
                    <p className="text-xl font-bold text-blue-600">{selectedCert.score}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ISSUE DATE</p>
                    <p className="text-sm font-semibold text-gray-700">{selectedCert.issueDate}</p>
                  </div>
                </div>
                
                {selectedCert.skills && selectedCert.skills.length > 0 && (
                  <div className="my-4">
                    <p className="text-xs text-gray-500 mb-2">SKILLS EARNED</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {selectedCert.skills.map((skill, idx) => (
                        <span key={idx} className="bg-amber-100 px-3 py-1 rounded-full text-xs text-amber-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-amber-300 mt-6 pt-4">
                  <p className="text-xs text-gray-400">Certificate ID: {selectedCert.id}</p>
                  <p className="text-xs text-gray-400 mt-1">EduHub - Empowering Education</p>
                </div>
                <div className="text-3xl mt-4">✨ 🌟 ✨</div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDownloadPNG}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition"
                >
                  💾 Download as PNG
                </button>
                <button
                  onClick={() => handleShare(selectedCert)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition"
                >
                  📤 Share Certificate
                </button>
              </div>
              <button
                onClick={closeModal}
                className={`w-full mt-3 py-2 text-sm transition rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}