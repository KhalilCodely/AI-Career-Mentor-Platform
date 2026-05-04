"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skillsRes, userSkillsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/user-skills", { credentials: "include" }),
        ]);

        const skillsData = await skillsRes.json();
        const userSkillsData = await userSkillsRes.json();

        setSkills(skillsData);

        const selectedIds = userSkillsData.map(
          (s: any) => s.skillId
        );

        setSelected(selectedIds);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};

    skills.forEach((skill) => {
      const category = skill.category?.name || "Other";
      if (!map[category]) map[category] = [];
      map[category].push(skill);
    });

    return map;
  }, [skills]);

  const filteredGrouped = useMemo(() => {
    if (!search) return grouped;

    const result: typeof grouped = {};

    Object.entries(grouped).forEach(([cat, skills]) => {
      const filtered = skills.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );

      if (filtered.length) result[cat] = filtered;
    });

    return result;
  }, [search, grouped]);

  const toggleSkill = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const saveSkills = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/user-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          skillIds: selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">

      {/* 🔥 TOP STICKY HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Skills & Expertise
          </h1>
          <p className="text-gray-500 text-sm">
            Personalize your experience
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 md:w-64 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
          />

          <button
            onClick={saveSkills}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 transition"
          >
            {loading && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* 🔥 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">

        <div className="mb-4 text-sm text-gray-500">
          {selected.length} skills selected
        </div>

        <div className="space-y-8">
          {Object.entries(filteredGrouped).map(([category, skills]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3">
                {category}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {skills.map((skill) => {
                  const isSelected = selected.includes(skill.id);

                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`
                        relative p-3 rounded-xl border text-sm transition
                        flex items-center justify-center text-center
                        ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white hover:bg-gray-100"
                        }
                      `}
                    >
                      {skill.name}

                      {isSelected && (
                        <Check
                          size={16}
                          className="absolute top-2 right-2"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}