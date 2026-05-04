"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    bio: "",
    education: "",
    experienceLevel: "",
    careerGoal: "",
    profileImage: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ load profile
  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data) setProfile(data);
      });
  }, []);

  // ✅ upload image
  const uploadImage = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  // ✅ save profile
  const handleSave = async () => {
    setLoading(true);

    let imageUrl = profile.profileImage;

    if (file) {
      imageUrl = await uploadImage();
    }

    await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...profile,
        profileImage: imageUrl,
      }),
      credentials: "include",
    });

    alert("Profile saved");
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">

      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* IMAGE */}
      <div className="mb-4">
        {profile.profileImage && (
          <img
            src={profile.profileImage}
            alt="profile"
            className="w-24 h-24 rounded-full mb-2 object-cover"
          />
        )}

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {/* BIO */}
      <textarea
        placeholder="Bio"
        value={profile.bio || ""}
        onChange={(e) =>
          setProfile({ ...profile, bio: e.target.value })
        }
        className="w-full mb-3 p-2 border rounded"
      />

      {/* EDUCATION */}
      <input
        placeholder="Education"
        value={profile.education || ""}
        onChange={(e) =>
          setProfile({ ...profile, education: e.target.value })
        }
        className="w-full mb-3 p-2 border rounded"
      />

      {/* EXPERIENCE */}
      <input
        placeholder="Experience Level"
        value={profile.experienceLevel || ""}
        onChange={(e) =>
          setProfile({ ...profile, experienceLevel: e.target.value })
        }
        className="w-full mb-3 p-2 border rounded"
      />

      {/* GOAL */}
      <input
        placeholder="Career Goal"
        value={profile.careerGoal || ""}
        onChange={(e) =>
          setProfile({ ...profile, careerGoal: e.target.value })
        }
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}