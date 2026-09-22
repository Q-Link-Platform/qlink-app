"use client";

import React, { useState, useRef } from "react";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name?: string | null;
    handle?: string | null;
    bio?: string | null;
    image?: string | null;
    banner?: string | null;
    location?: string | null;
    website?: string | null;
  };
  onSaved: (updatedUser: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaved,
}) => {
  const [name, setName] = useState(currentUser.name || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [image, setImage] = useState(currentUser.image || "");
  const [banner, setBanner] = useState(currentUser.banner || "");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Avatar Image Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar size must be less than 2MB.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/profile-pic", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setImage(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Banner Image Upload
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file for the banner.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Banner size must be less than 5MB.");
      return;
    }

    setUploadingBanner(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/banner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload banner");
      }

      setBanner(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Save Profile Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          location: location.trim() || null,
          website: website.trim() || null,
          image: image || null,
          banner: banner || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccess(true);
      if (onSaved) {
        onSaved(data.user);
      }

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-slate-950/90 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title="Cancel"
            >
              ✕
            </button>
            <h2 className="text-base font-bold text-white tracking-tight">Edit Profile</h2>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploadingAvatar || uploadingBanner}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all shadow-md ${
              success
                ? "bg-emerald-500 text-white"
                : "bg-white hover:bg-slate-200 text-slate-950 active:scale-95 disabled:opacity-50"
            }`}
          >
            {saving ? "Saving..." : success ? "✓ Saved" : "Save"}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
          {/* Banner Upload Area */}
          <div
            className="relative w-full h-32 sm:h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800/80 flex items-center justify-center overflow-hidden group cursor-pointer"
            style={
              banner
                ? {
                    backgroundImage: `url(${banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            onClick={() => bannerInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/20 text-white text-xs font-medium backdrop-blur-md shadow-md group-hover:scale-105 transition-transform">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{uploadingBanner ? "Uploading..." : banner ? "Change Header" : "Add Header Banner"}</span>
              </div>

              {banner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBanner("");
                  }}
                  className="p-1.5 rounded-full bg-slate-950/80 border border-white/20 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 backdrop-blur-md transition"
                  title="Remove header"
                >
                  ✕
                </button>
              )}
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBannerFileChange}
            />
          </div>

          {/* Avatar Area (overlapping banner) */}
          <div className="px-5 -mt-12 sm:-mt-14 mb-4 relative z-10 flex items-end justify-between">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-slate-900 border-4 border-slate-950 shadow-xl relative">
                {image ? (
                  <img src={image} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-extrabold text-2xl text-white bg-gradient-to-br from-cyan-600 via-slate-800 to-indigo-950">
                    {(name?.[0] || currentUser.handle?.[0] || "Q").toUpperCase()}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <svg className="h-6 w-6 text-white drop-shadow-md group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-5 mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="px-5 space-y-4">
            {/* Display Name */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Display Name</label>
                <span className="text-[11px] text-slate-500">{name.length}/50</span>
              </div>
              <input
                type="text"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/80 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              />
            </div>

            {/* Handle / Username indicator */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Handle</label>
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-sm font-mono text-slate-400 flex items-center justify-between">
                <span>@{currentUser.handle || "your-handle"}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Unique Q-ID</span>
              </div>
            </div>

            {/* Bio Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Bio</label>
                <span className={`text-[11px] ${bio.length > 260 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                  {bio.length}/280
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={280}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself, your projects, or your interests..."
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/80 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Location</label>
                <span className="text-[11px] text-slate-500">{location.length}/60</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">📍</span>
                <input
                  type="text"
                  maxLength={60}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or London, UK"
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/80 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                />
              </div>
            </div>

            {/* Website / Links */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Website</label>
                <span className="text-[11px] text-slate-500">{website.length}/100</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">🔗</span>
                <input
                  type="text"
                  maxLength={100}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/80 focus:bg-slate-900 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
