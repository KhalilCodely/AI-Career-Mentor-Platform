import { Check } from "lucide-react";
import type { SkillOption } from "../types";

type SkillsGridProps = {
  groupedSkills: Record<string, SkillOption[]>;
  onToggleSkill: (id: string) => void;
  selectedSkillIds: string[];
};

export function SkillsGrid({ groupedSkills, onToggleSkill, selectedSkillIds }: SkillsGridProps) {
  return (
    <div className="space-y-8">
      {Object.entries(groupedSkills).map(([category, skills]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-3">{category}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {skills.map((skill) => {
              const isSelected = selectedSkillIds.includes(skill.id);

              return (
                <button
                  key={skill.id}
                  onClick={() => onToggleSkill(skill.id)}
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
                    <Check size={16} className="absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
