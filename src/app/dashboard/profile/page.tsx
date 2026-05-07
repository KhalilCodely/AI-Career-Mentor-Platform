"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

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

type Notice = {
  type: "success" | "error";
  message: string;
};

const emptyProfile: UserProfile = {
  bio: "",
  education: "",
  experienceLevel: "",
  careerGoal: "",
  profileImage: "",
};

const experienceOptions = ["Beginner", "Intermediate", "Advanced"];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to save profile";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        const data = (await res.json()) as ProfileResponse;

        if (data?.data) {
          setProfile({ ...emptyProfile, ...data.data });
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

  const completionPercent = useMemo(() => {
    const fields = [
      profile.profileImage,
      profile.bio,
      profile.education,
      profile.experienceLevel,
      profile.careerGoal,
    ];
    const completed = fields.filter((value) => value?.trim()).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const previewImage = filePreviewUrl || profile.profileImage;

  const updateProfileField = (field: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setNotice(null);
    setFilePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
  };

  const uploadImage = async () => {
    if (!file) return profile.profileImage;

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

    let data: { url?: string; error?: string };
    try {
      data = JSON.parse(text) as { url?: string; error?: string };
    } catch {
      console.error("UPLOAD NON-JSON:", text);
      throw new Error("Upload server error");
    }

    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Upload failed");
    }

    return data.url;
  };

  const handleSave = async () => {
    setLoading(true);
    setNotice(null);

    try {
      let imageUrl = profile.profileImage;

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

      const data = (await res.json()) as ProfileResponse;

      if (!res.ok) throw new Error(data.error);

      setProfile((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
      setFile(null);
      setFilePreviewUrl("");
      setNotice({ type: "success", message: "Profile updated successfully" });
    } catch (err: unknown) {
      console.error(err);
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-200">
          <Loader2 className="h-5 w-5 animate-spin text-black" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-black text-white shadow-sm">
        <div className="relative px-6 py-8 md:px-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/15">
                <Sparkles className="h-4 w-4" />
                Profile workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Build a mentor-ready profile
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/70 md:text-base">
                Keep your background, goals, and experience level fresh so Career
                Mentor can tailor recommendations to your next move.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 lg:min-w-72">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-white/70">Profile completion</span>
                <span className="font-semibold">{completionPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 md:p-6">
          <div className="mb-6 flex flex-col gap-5 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-gray-100 ring-1 ring-gray-200">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <UserRound className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-950">
                  Personal details
                </h2>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Add a clear photo and concise details that describe where you
                  are now and where you want to go.
                </p>
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-100">
              <Camera className="h-4 w-4" />
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Bio
              </span>
              <textarea
                value={profile.bio || ""}
                onChange={(event) => updateProfileField("bio", event.target.value)}
                className="min-h-32 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100"
                placeholder="Share your current role, interests, and what you want help with."
                rows={5}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Education
              </span>
              <input
                value={profile.education || ""}
                onChange={(event) =>
                  updateProfileField("education", event.target.value)
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100"
                placeholder="e.g. B.S. Computer Science"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Experience level
              </span>
              <select
                value={profile.experienceLevel || ""}
                onChange={(event) =>
                  updateProfileField("experienceLevel", event.target.value)
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100"
              >
                <option value="">Select level</option>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Career goal
              </span>
              <input
                value={profile.careerGoal || ""}
                onChange={(event) =>
                  updateProfileField("careerGoal", event.target.value)
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-gray-100"
                placeholder="e.g. Become a full-stack engineer in 12 months"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500">
              JPG or PNG images are supported up to 2MB.
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving changes..." : "Save profile"}
            </button>
          </div>

          {notice ? (
            <div
              className={`mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${
                notice.type === "success"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : null}
              {notice.message}
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-950">Profile snapshot</h2>
            <p className="mt-1 text-sm text-gray-500">
              A quick view of the signals used to personalize your dashboard.
            </p>

            <div className="mt-5 space-y-3">
              <SnapshotItem
                icon={GraduationCap}
                label="Education"
                value={profile.education || "Add your education"}
              />
              <SnapshotItem
                icon={BriefcaseBusiness}
                label="Experience"
                value={profile.experienceLevel || "Choose a level"}
              />
              <SnapshotItem
                icon={Target}
                label="Goal"
                value={profile.careerGoal || "Set a career goal"}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-gray-950 p-5 text-white shadow-sm">
            <h2 className="text-lg font-semibold">Profile tips</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
              <li>• Keep your goal specific and measurable.</li>
              <li>• Mention the role, domain, or stack you are targeting.</li>
              <li>• Update your profile as your skills grow.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

type SnapshotItemProps = {
  icon: typeof GraduationCap;
  label: string;
  value: string;
};

function SnapshotItem({ icon: Icon, label, value }: SnapshotItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-900 ring-1 ring-gray-200">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}
