"use client";

import Gantt from "frappe-gantt";
import "@/node_modules/frappe-gantt/dist/frappe-gantt.css";
import { GanttTask } from "./ProjectPage";
import { useEffect, useRef } from "react";

export default function GanttChart({ ganttData }: { ganttData: GanttTask[] }) {
  const ganttRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ganttRef.current) return;
    const gantt = new Gantt(ganttRef.current, ganttData, {
      view_mode: "Month",
      scroll_to: "end",
      view_mode_select: true,
      infinite_padding: false,
    });
    return () => {
      gantt.clear();
    };
  }, [ganttData]);
  return (
    <div className="flex w-full">
      <div ref={ganttRef} className="w-full"></div>
    </div>
  );
}
