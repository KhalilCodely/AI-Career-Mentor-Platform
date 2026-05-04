"use client";

import { useEffect, useState } from "react";

type Skill = {
  id: string;
  name: string;
  category?: {
    name: string;
  };
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ load skills
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/skills");

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setSkills(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ select skill
  const toggleSkill = (id: string) => {
    setSelected((prev) => {
      const copy = { ...prev };

      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = 1;
      }

      return copy;
    });
  };

  // ✅ change level
  const changeLevel = (id: string, level: number) => {
    setSelected((prev) => ({
      ...prev,
      [id]: level,
    }));
  };

  // ✅ save skills
  const saveSkills = async () => {
    setSaving(true);

    try {
      await Promise.all(
        Object.entries(selected).map(([skillId, level]) =>
          fetch("/api/skills", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ skillId, level }),
            credentials: "include",
          })
        )
      );

      alert("✅ Skills saved");
    } catch (err) {
      console.error(err);
      alert("❌ Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Select Your Skills
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`border p-4 rounded cursor-pointer ${
              selected[skill.id] ? "bg-green-100" : ""
            }`}
            onClick={() => toggleSkill(skill.id)}
          >
            <h2 className="font-semibold">{skill.name}</h2>
            <p className="text-sm text-gray-500">
              {skill.category?.name}
            </p>

            {selected[skill.id] && (
              <select
                value={selected[skill.id]}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  changeLevel(skill.id, Number(e.target.value))
                }
                className="mt-2 w-full border"
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={saveSkills}
        disabled={saving}
        className="mt-6 bg-black text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Skills"}
      </button>
    </div>
  );
}