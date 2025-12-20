import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DeconstructItem = {
  item: string;
  category: "CRÍTICO" | "RUIDO" | "VULNERABILIDAD";
  verdict: string;
};

interface DataDeconstructorProps {
  data: DeconstructItem[];
}

export function DataDeconstructor({ data }: DataDeconstructorProps) {
  const [visibleRows, setVisibleRows] = useState<number>(0);

  // Effect to simulate "row by row" processing/scanning
  useEffect(() => {
    if (visibleRows < data.length) {
      const timeout = setTimeout(() => {
        setVisibleRows((prev) => prev + 1);
      }, 100); // Fast bips/row appearance
      return () => clearTimeout(timeout);
    }
  }, [visibleRows, data.length]);

  return (
    <div className="w-full my-4 font-mono-wadi text-xs border border-[var(--wadi-border)] bg-black/40 relative overflow-hidden group">
      {/* SCANLINES EFFECT */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 background-size-[100%_2px,3px_100%] animate-scanlines" />

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--wadi-border)] bg-[var(--wadi-surface)] text-[var(--wadi-text-muted)] uppercase tracking-wider">
            <th className="p-3 border-r border-[var(--wadi-border)] w-[40%]">
              [ITEM]
            </th>
            <th className="p-3 border-r border-[var(--wadi-border)] w-[20%]">
              [CATEGORÍA]
            </th>
            <th className="p-3 w-[40%]">[VEREDICTO_MONDAY]</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isVisible = idx < visibleRows;
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b border-[var(--wadi-border)]/30 transition-opacity duration-200",
                  isVisible ? "opacity-100" : "opacity-0"
                )}
              >
                <td className="p-3 border-r border-[var(--wadi-border)]/30 text-[var(--wadi-text)] break-words">
                  {row.item}
                </td>
                <td
                  className={cn(
                    "p-3 border-r border-[var(--wadi-border)]/30 font-bold",
                    row.category === "CRÍTICO" && "text-[#E6E6FA]", // Lavanda
                    row.category === "RUIDO" && "text-gray-500", // Gris apagado
                    row.category === "VULNERABILIDAD" &&
                      "text-red-500 animate-pulse" // Rojo parpadeante
                  )}
                >
                  {row.category}
                </td>
                <td className="p-3 text-[var(--wadi-text-muted)] italic">
                  {row.verdict}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
