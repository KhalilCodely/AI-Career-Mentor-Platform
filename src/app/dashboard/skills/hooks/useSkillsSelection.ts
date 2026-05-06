"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApiResponse, SkillOption, UserSkillsPayload } from "../types";

type GroupedSkills = Record<string, SkillOption[]>;

async function parseJsonResponse<T>(response: Response): Promise<Extract<ApiResponse<T>, { success: true }>> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = "error" in payload ? payload.error : "Request failed";
    throw new Error(message);
  }

  return payload;
}

export function useSkillsSelection() {
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        const response = await fetch("/api/user/skills", { credentials: "include" });
        const payload = await parseJsonResponse<UserSkillsPayload>(response);

        setSkills(payload.data.skills);
        setSelected(payload.data.selectedSkillIds);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load skills");
      } finally {
        setInitialLoading(false);
      }
    };

    void loadData();
  }, []);

  const grouped = useMemo(() => {
    return skills.reduce<GroupedSkills>((map, skill) => {
      const category = skill.category?.name || "Other";
      map[category] = [...(map[category] || []), skill];
      return map;
    }, {});
  }, [skills]);

  const filteredGrouped = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return grouped;

    return Object.entries(grouped).reduce<GroupedSkills>((result, [category, categorySkills]) => {
      const filtered = categorySkills.filter((skill) =>
        skill.name.toLowerCase().includes(normalizedSearch)
      );

      if (filtered.length) result[category] = filtered;
      return result;
    }, {});
  }, [search, grouped]);

  const toggleSkill = (id: string) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((skillId) => skillId !== id)
        : [...previous, id]
    );
  };

  const saveSkills = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/user/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skillIds: selected }),
      });

      const payload = await parseJsonResponse<{ selectedSkillIds: string[] }>(response);
      setSelected(payload.data.selectedSkillIds);
      setMessage(payload.message || "Skills saved successfully");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save skills");
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    filteredGrouped,
    initialLoading,
    loading,
    message,
    saveSkills,
    search,
    selected,
    setSearch,
    toggleSkill,
  };
}
