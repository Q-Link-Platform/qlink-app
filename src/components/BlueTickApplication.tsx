'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BlueTickApplication {
  status: 'none' | 'pending' | 'verified' | 'rejected';
  appliedAt?: string;
  documentUrl?: string;
  points: number;
  canApply: boolean;
}

export default function BlueTickApplication() {
  const { data: session } = useSession();
  const [application, setApplication] = useState<BlueTickApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchApplicationStatus();
    }
  }, [session]);

  const fetchApplicationStatus = async () => {
    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      const response = await fetch(`/api/blue-tick/apply?userId=${userId}`);
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, or PDF file.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }

      setDocumentFile(file);
    }
  };

  const uploadDocument = async (): Promise<string | null> => {
    if (!documentFile) return null;

    const formData = new FormData();
    formData.append('file', documentFile);

    try {
      const response = await fetch('/api/upload/verification-document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  };

  const submitApplication = async () => {
    if (!application?.canApply) {
      alert('You need at least 100 points to apply for Blue Tick verification.');
      return;
    }

    setUploading(true);
    
    try {
      let documentUrl = null;
      if (documentFile) {
        documentUrl = await uploadDocument();
        if (!documentUrl) {
          alert('Failed to upload verification document. Please try again.');
          setUploading(false);
          return;
        }
      }

      const userId = (session?.user as any)?.id || session?.user?.email;
      const response = await fetch('/api/blue-tick/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          documentUrl 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Application submitted successfully! 100 points have been deducted.');
        await fetchApplicationStatus(); // Refresh status
        setDocumentFile(null); // Clear file input
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '⭕';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-sky-400">✓</span>
          Blue Tick Verification
        </h3>
        <p className="text-sm text-slate-400">
          Get verified as a real person or brand with a blue checkmark
        </p>
      </div>

      {/* Current Status */}
      {application && (
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Current Status:</span>
            <span className={`text-sm font-bold ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)} {application.status.toUpperCase()}
            </span>
          </div>
          
          {application.appliedAt && (
            <p className="text-xs text-slate-500">
              Applied: {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Application Form */}
      {application?.canApply && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Verification Document (Optional)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/60 rounded-lg text-sm text-slate-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700/50 file:text-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Upload ID proof, business registration, or other verification documents (Max 5MB)
            </p>
          </div>

          {documentFile && (
            <div className="bg-slate-800/30 rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-slate-300 truncate">
                📎 {documentFile.name}
              </span>
              <button
                onClick={() => setDocumentFile(null)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-300">
              ⚠️ <strong>100 points</strong> will be deducted from your account when you submit this application.
              If rejected, points will be refunded.
            </p>
          </div>

          <button
            onClick={submitApplication}
            disabled={uploading}
            className="w-full py-2 bg-sky-500/20 hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sky-400 rounded-lg text-sm font-medium transition-colors"
          >
            {uploading ? 'Submitting...' : 'Submit Application (100 points)'}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {application?.status === 'pending' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            ⏳ Your application is under review. This typically takes 24-48 hours.
          </p>
        </div>
      )}

      {application?.status === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-300">
            ❌ Your application was rejected. You can reapply after addressing the issues.
          </p>
        </div>
      )}

      {application?.status === 'verified' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs text-green-300">
            ✅ Congratulations! Your account is now verified with a Blue Tick.
          </p>
        </div>
      )}

      {/* Points Info */}
      <div className="text-xs text-slate-500">
        <p>Current Points: {application?.points || 0}</p>
        <p>Points Required: 100</p>
        {application?.points !== undefined && application.points < 100 && (
          <p className="text-yellow-400">
            Need {100 - application.points} more points to apply
          </p>
        )}
      </div>
    </div>
  );
}
