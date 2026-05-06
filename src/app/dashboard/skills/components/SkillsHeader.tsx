import { Loader2 } from "lucide-react";

type SkillsHeaderProps = {
  loading: boolean;
  onSave: () => void;
  onSearchChange: (value: string) => void;
  search: string;
};

export function SkillsHeader({ loading, onSave, onSearchChange, search }: SkillsHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Skills & Expertise</h1>
        <p className="text-gray-500 text-sm">Personalize your experience</p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="flex-1 md:w-64 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
        />

        <button
          onClick={onSave}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 transition"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
