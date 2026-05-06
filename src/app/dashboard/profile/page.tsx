"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Camera, GraduationCap, Loader2, Save, Sparkles, Target, UserRound } from "lucide-react";

type UserProfile = {
  name?: string;
  email?: string;
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

type UploadResponse = {
  url?: string;
  error?: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

const experienceOptions = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to save profile";
}

async function parseJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
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
  const [status, setStatus] = useState<StatusMessage>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = await parseJson<ProfileResponse>(res);

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile");
        }

        if (data.data) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", text: getErrorMessage(err) });
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

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setStatus(null);
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (selectedFile: File | null) => {
    setStatus(null);
    setFile(selectedFile);

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setFilePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
  };

  const uploadImage = async () => {
    if (!file) return profile.profileImage;

    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please upload an image.");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 2MB.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await parseJson<UploadResponse>(res);

    if (!res.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }

    return data.url;
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const imageUrl = await uploadImage();

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bio: profile.bio,
          education: profile.education,
          experienceLevel: profile.experienceLevel,
          careerGoal: profile.careerGoal,
          profileImage: imageUrl,
        }),
      });

      const data = await parseJson<ProfileResponse>(res);

      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setProfile((prev) => ({
        ...prev,
        ...(data.data || {}),
        profileImage: imageUrl,
      }));

      setFile(null);
      setFilePreviewUrl("");
      setStatus({ type: "success", text: "Profile updated successfully" });
    } catch (err: unknown) {
      console.error(err);
      setStatus({ type: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const profileImage = filePreviewUrl || profile.profileImage;
  const completionItems = [
    profile.bio,
    profile.education,
    profile.experienceLevel,
    profile.careerGoal,
    profile.profileImage,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-purple-100">
              <Sparkles size={16} />
              Career identity
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">Build a profile that guides your roadmap</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
              Keep your education, experience, and goals updated so recommendations feel relevant to where you are now.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur sm:min-w-72">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Profile completion</span>
              <span>{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-purple-300 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-300">Complete every field to improve personalization.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex justify-center">
              <div className="relative size-32 overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-inner">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile preview"
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <UserRound size={42} />
                  </div>
                )}
              </div>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">{profile.name || "Your profile"}</h2>
            <p className="text-sm text-gray-500">{profile.email || "Add details to personalize your account"}</p>

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700">
              <Camera size={16} />
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">JPG or PNG up to 2MB</p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-950">Profile snapshot</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <GraduationCap className="text-purple-600" size={18} />
                <span className="text-gray-600">{profile.education || "Education not added"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <BriefcaseBusiness className="text-purple-600" size={18} />
                <span className="text-gray-600">{profile.experienceLevel || "Experience not selected"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <Target className="text-purple-600" size={18} />
                <span className="text-gray-600">{profile.careerGoal || "Career goal not added"}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Profile details</h2>
              <p className="text-sm text-gray-500">Manage the information used for career guidance.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Saving..." : "Save profile"}
            </button>
          </div>

          {status && (
            <div className={`mb-5 rounded-2xl border p-4 text-sm ${status.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {status.text}
            </div>
          )}

          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
              <textarea
                value={profile.bio || ""}
                onChange={(event) => updateProfile("bio", event.target.value)}
                className="min-h-36 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                rows={5}
                maxLength={500}
                placeholder="Share what you are learning, your strengths, and what kind of role you want next."
              />
              <span className="mt-1 block text-right text-xs text-gray-400">{profile.bio?.length || 0}/500</span>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Education</span>
                <input
                  value={profile.education || ""}
                  onChange={(event) => updateProfile("education", event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  placeholder="e.g. Computer Science student"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Experience level</span>
                <select
                  value={profile.experienceLevel || ""}
                  onChange={(event) => updateProfile("experienceLevel", event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Select level</option>
                  {experienceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Career goal</span>
              <input
                value={profile.careerGoal || ""}
                onChange={(event) => updateProfile("careerGoal", event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                placeholder="e.g. Become a full-stack developer"
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
