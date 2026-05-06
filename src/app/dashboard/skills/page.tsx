"use client";

import { Loader2 } from "lucide-react";
import { SkillsGrid } from "./components/SkillsGrid";
import { SkillsHeader } from "./components/SkillsHeader";
import { useSkillsSelection } from "./hooks/useSkillsSelection";

export default function SkillsPage() {
  const {
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
  } = useSkillsSelection();

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <SkillsHeader
        loading={loading}
        onSave={saveSkills}
        onSearchChange={setSearch}
        search={search}
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="mb-4 text-sm text-gray-500">
          {selected.length} skills selected
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 text-sm text-green-600">{message}</div>}

        <SkillsGrid
          groupedSkills={filteredGrouped}
          onToggleSkill={toggleSkill}
          selectedSkillIds={selected}
        />
      </div>
    </div>
  );
}
