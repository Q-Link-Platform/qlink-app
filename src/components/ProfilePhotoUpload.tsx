'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePhotoUpload() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, WebP, or GIF file.');
        return;
      }

      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 2MB.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', (session?.user as any)?.id || session?.user?.email || '');

      const response = await fetch('/api/profile-photo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile photo uploaded successfully!');
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // You might want to refresh the user data here
      } else {
        alert(data.error || 'Failed to upload profile photo');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      const userId = (session?.user as any)?.id || session?.user?.email || '';
      const response = await fetch('/api/profile-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile photo removed successfully!');
        setPreviewUrl(null);
        // You might want to refresh the user data here
      } else {
        alert(data.error || 'Failed to remove profile photo');
      }
    } catch (error) {
      console.error('Error removing profile photo:', error);
      alert('Failed to remove profile photo. Please try again.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-purple-400">📷</span>
          Profile Photo
        </h3>
        <p className="text-sm text-slate-400">
          Upload a profile photo to personalize your identity
        </p>
      </div>

      {/* Current/Preview Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-slate-600/60 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-slate-500">👤</span>
            )}
          </div>
          {previewUrl && (
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-colors"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            {previewUrl ? 'Preview' : 'No photo selected'}
          </p>
          <p className="text-xs text-slate-500">
            JPEG, PNG, WebP, or GIF (Max 2MB)
          </p>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/60 rounded-lg text-sm text-slate-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700/50 file:text-slate-200"
          />
        </div>

        {previewUrl && (
          <div className="flex gap-2">
            <button
              onClick={uploadPhoto}
              disabled={uploading}
              className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-purple-400 rounded-lg text-sm font-medium transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button
              onClick={() => setPreviewUrl(null)}
              className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {!previewUrl && (
          <div className="text-xs text-slate-500">
            Select a photo to upload or update your profile picture
          </div>
        )}
      </div>

      {/* Remove Photo Option */}
      <div className="border-t border-slate-700/60 pt-4">
        <button
          onClick={removePhoto}
          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          Remove Current Profile Photo
        </button>
      </div>
    </div>
  );
}
