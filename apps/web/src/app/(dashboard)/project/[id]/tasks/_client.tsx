"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToTasks,
  addTask,
  updateTask,
  type TaskData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";

export function TasksClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newStatus, setNewStatus] = useState<"upcoming" | "in-progress">("upcoming");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToTasks(projectId, setTasks);
    return () => unsub();
  }, [projectId]);

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  useEffect(() => {
    setTopbar("Tasks", `${activeTasks.length} remaining`, "warning");
  }, [activeTasks.length, setTopbar]);

  async function handleSave() {
    if (!newLabel.trim()) return;
    setSaving(true);
    await addTask({
      projectId,
      label: newLabel.trim(),
      status: newStatus,
      done: false,
      order: tasks.length,
    });
    setNewLabel("");
    setNewStatus("upcoming");
    setShowForm(false);
    setSaving(false);
  }

  function handleCancel() {
    setNewLabel("");
    setNewStatus("upcoming");
    setShowForm(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Active tasks</SectionLabel>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
        >
          <Plus size={14} />
          Add task
        </button>
      </div>

      {showForm && (
        <Card padding="sm" className="mb-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task description"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              autoFocus
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as "upcoming" | "in-progress")}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In progress</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !newLabel.trim()}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTasks.length > 0 && (
        <Card padding="sm" className="mb-5">
          {activeTasks.map((task, i) => (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 py-1.5 text-[12px] ${
                i < activeTasks.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div
                className="w-4 h-4 rounded border-[1.5px] border-border-dark shrink-0 cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={() => updateTask(projectId, task.id!, { done: true, status: "done" })}
              />
              <span className="flex-1 text-muted">{task.label}</span>
              <Badge variant={task.status === "in-progress" ? "warning" : "info"}>
                {task.status === "in-progress" ? "In progress" : "Upcoming"}
              </Badge>
            </div>
          ))}
        </Card>
      )}

      {activeTasks.length === 0 && !showForm && (
        <Card padding="md" className="mb-5 text-center">
          <p className="text-[12px] text-muted">No active tasks. Add one above or they will appear as your project progresses.</p>
        </Card>
      )}

      <SectionLabel>Completed tasks ({completedTasks.length})</SectionLabel>
      <Card padding="sm">
        {completedTasks.length === 0 ? (
          <p className="text-[11px] text-muted py-2">None yet.</p>
        ) : (
          completedTasks.map((task, i) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 py-1.5 text-[11px] ${
                i < completedTasks.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div
                className="w-4 h-4 rounded border-[1.5px] bg-success border-success shrink-0 flex items-center justify-center cursor-pointer"
                onClick={() => updateTask(projectId, task.id!, { done: false, status: "upcoming" })}
              >
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="flex-1 text-muted line-through opacity-40">{task.label}</span>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
