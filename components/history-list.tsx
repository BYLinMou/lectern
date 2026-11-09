"use client";

import { ChevronRight, Folder, FolderInput, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lecture } from "@/lib/types";

export function HistoryList({
  lectures,
  activeId,
  onSelect,
  onDelete,
  onMove,
  disabled,
}: {
  lectures: Lecture[];
  activeId: string | null;
  onSelect: (l: Lecture) => void;
  onDelete: (l: Lecture) => void;
  onMove: (l: Lecture, project?: string) => void;
  disabled?: boolean;
}) {
  const projects = [...new Set(lectures.flatMap((l) => (l.project ? [l.project] : [])))].sort();
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2" aria-labelledby="history-heading">
      <h2
        id="history-heading"
        className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        <History className="size-3.5" aria-hidden /> Past lectures
      </h2>
      {lectures.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing saved yet. Finished lectures stay in this browser.
        </p>
      ) : (
        <div
          className="flex max-h-64 flex-col gap-1 overflow-y-auto lg:max-h-none lg:flex-1"
          aria-label="Past lectures"
        >
          {[...projects, ""].map((project) => (
            <details
              key={project}
              open
              className="group/project"
              aria-label={project ? `Project ${project}` : "Ungrouped"}
            >
              <summary className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent">
                <ChevronRight className="size-3.5 group-open/project:rotate-90" aria-hidden />
                <Folder className="size-4" aria-hidden />
                <span className="truncate">{project || "Ungrouped"}</span>
              </summary>
              <ul aria-label={project ? `${project} recordings` : "Ungrouped recordings"}>
                {lectures
                  .filter((l) => (l.project ?? "") === project)
                  .map((l) => (
                    <li key={l.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(l)}
                        className={cn(
                          "relative w-full cursor-pointer rounded-lg px-3 py-2.5 pr-18 text-left transition-colors duration-200 hover:bg-sidebar-accent",
                          activeId === l.id &&
                            "bg-primary/12 ring-1 ring-primary/35 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary",
                        )}
                      >
                        <span className="line-clamp-2 text-sm font-medium">{l.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(l.createdAt)}
                          {l.notes ? "" : " · no notes yet"}
                        </span>
                      </button>
                      <label className="absolute top-1/2 right-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground focus-within:ring-2 focus-within:ring-ring hover:bg-sidebar-accent">
                        <FolderInput className="size-4" aria-hidden />
                        <select
                          aria-label={`Move ${l.title} to project`}
                          title="Move to project"
                          className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                          disabled={disabled}
                          value={l.project ? `project:${l.project}` : ""}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            if (value === "new") {
                              const name = window.prompt("New project name")?.trim();
                              if (name) onMove(l, name);
                            } else onMove(l, value.slice(8) || undefined);
                          }}
                        >
                          <option value="">Ungrouped</option>
                          {projects.map((name) => (
                            <option key={name} value={`project:${name}`}>
                              {name}
                            </option>
                          ))}
                          <option value="new">New project…</option>
                        </select>
                      </label>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${l.title}`}
                        className="absolute top-1/2 right-1.5 -translate-y-1/2 opacity-70 hover:opacity-100"
                        onClick={() => onDelete(l)}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
