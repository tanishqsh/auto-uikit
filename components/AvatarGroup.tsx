import React from "react";

interface AvatarGroupProps {
  avatars: { initials: string; color?: "blue" | "slate" | "red" | "green" }[];
  size?: "sm" | "md" | "lg";
  max?: number;
}

const colors = { blue: "bg-blue-500", slate: "bg-slate-500", red: "bg-red-500", green: "bg-green-500" };
const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };

const AvatarGroup = ({ avatars, size = "md", max = 5 }: AvatarGroupProps) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  return (
    <div className="flex -space-x-2" role="group" aria-label={`Group of ${avatars.length} avatars`}>
      {visible.map((a, i) => (
        <div key={i} className={`${sizes[size]} ${colors[a.color || "blue"]} rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white dark:ring-zinc-900 transition-all duration-200 hover:scale-110 hover:z-10`} aria-label={a.initials}>
          {a.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div className={`${sizes[size]} bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-medium ring-2 ring-white dark:ring-zinc-900`}>
          +{overflow}
        </div>
      )}
    </div>
  );
};

export const __demo = () => (
  <div className="flex flex-col gap-4">
    <AvatarGroup avatars={[{ initials: "AB" }, { initials: "CD" }, { initials: "EF", color: "green" }]} />
    <AvatarGroup avatars={[{ initials: "GH", color: "red" }, { initials: "IJ" }, { initials: "KL" }, { initials: "MN" }]} size="lg" />
    <AvatarGroup avatars={[{ initials: "A" }, { initials: "B" }, { initials: "C" }, { initials: "D" }, { initials: "E" }, { initials: "F" }]} max={3} size="sm" />
  </div>
);

export default AvatarGroup;
