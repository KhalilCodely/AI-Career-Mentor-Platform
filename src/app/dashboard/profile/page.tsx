"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type UserProfile = {
  bio: string;
  education: string;
  experienceLevel: string;
  careerGoal: string;
  profileImage: string;
};

type ProfileResponse = {
  data?: UserProfile;
  error?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "❌ Failed to save profile";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    bio: "",
    education: "",
    experienceLevel: "",
    careerGoal: "",
    profileImage: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState("");

  // ✅ load profile
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = await res.json() as ProfileResponse;

        if (data?.data) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setFilePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
  };

 const uploadImage = async () => {
  if (!file) return profile.profileImage;

  // ✅ validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File too large (max 2MB)");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("UPLOAD NON-JSON:", text);
    throw new Error("Upload server error");
  }

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Upload failed");
  }

  console.log("UPLOAD SUCCESS:", data.url);

  return data.url;
};

 const handleSave = async () => {
  setLoading(true);
  setSuccess("");

  try {
    let imageUrl = profile.profileImage;

    // ✅ only overwrite if upload succeeds
    if (file) {
      imageUrl = await uploadImage();
    }

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...profile,
        profileImage: imageUrl,
      }),
    });

    const data = await res.json() as ProfileResponse;

    if (!res.ok) throw new Error(data.error);

    // ✅ update UI immediately
    setProfile((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }));

    setFile(null);

    setSuccess("Profile updated successfully ✅");

  } catch (err: unknown) {
    console.error(err);
    setSuccess(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

  if (initialLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">
        Manage your personal information and career goals
      </p>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border">
            {filePreviewUrl || profile.profileImage ? (
              <Image
                src={filePreviewUrl || profile.profileImage}
                alt="Profile preview"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>

          <div>
            <input
              type="file"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null)
              }
              className="text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG up to 2MB
            </p>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
            rows={4}
          />
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Education
          </label>
          <input
            value={profile.education || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                education: e.target.value,
              })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Experience Level
          </label>
          <select
            value={profile.experienceLevel || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                experienceLevel: e.target.value,
              })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Career Goal */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Career Goal
          </label>
          <input
            value={profile.careerGoal || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                careerGoal: e.target.value,
              })
            }
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        {/* Success message */}
        {success && (
          <div className="text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

      </div>
    </div>
  );
}