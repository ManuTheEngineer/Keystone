"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  validateContractorToken,
  contractorCompleteTask,
  type ContractorLink,
} from "@/lib/services/contractor-service";
import type { ProjectData, TaskData, DailyLogData } from "@/lib/services/project-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import { CheckCircle2, Circle, Camera, AlertTriangle, Clock } from "lucide-react";

const PHASE_NAMES = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];

export default function ContractorPage() {
  const params = useParams();
  const token = params.token as string;

  const [link, setLink] = useState<ContractorLink | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const validated = await validateContractorToken(token);
        if (!validated) {
          setError("This link is invalid or has been revoked.");
          setLoading(false);
          return;
        }
        setLink(validated);

        // Fetch project data
        const projSnap = await get(ref(db, `users/${validated.userId}/projects/${validated.projectId}`));
        if (projSnap.exists()) {
          setProject({ id: validated.projectId, ...projSnap.val() });
        }

        // Fetch tasks
        const tasksSnap = await get(ref(db, `users/${validated.userId}/projects/${validated.projectId}/tasks`));
        if (tasksSnap.exists()) {
          const data = tasksSnap.val() as Record<string, TaskData>;
          setTasks(Object.entries(data).map(([id, t]) => ({ ...t, id })));
        }

        // Fetch recent logs
        const logsSnap = await get(ref(db, `users/${validated.userId}/projects/${validated.projectId}/dailyLogs`));
        if (logsSnap.exists()) {
          const data = logsSnap.val() as Record<string, DailyLogData>;
          const arr = Object.entries(data)
            .map(([id, l]) => ({ ...l, id }))
            .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
            .slice(0, 5);
          setLogs(arr);
        }
      } catch {
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleComplete(taskId: string) {
    if (!link) return;
    setCompletingTask(taskId);
    try {
      await contractorCompleteTask(token, link.userId, link.projectId, taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: true, status: "done" } : t)));
      setToast("Task marked complete.");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("Failed to update task.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setCompletingTask(null);
    }
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle size={48} className="text-[#BC6C25] mb-4" />
        <h1 className="text-[22px] text-[#2C1810] mb-2" style={{ fontFamily: "Georgia, serif" }}>
          Link unavailable
        </h1>
        <p className="text-[14px] text-[#6A6A6A] max-w-md">{error}</p>
        <a href="https://keystonebuild.vercel.app" className="mt-6 text-[13px] text-[#8B4513] hover:underline">
          Learn about Keystone
        </a>
      </div>
    );
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const phaseName = PHASE_NAMES[project?.currentPhase ?? 0] || "Build";
  const pendingTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 bg-[#2D6A4F] text-white text-[13px] rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#2C1810] text-[#D4A574] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <KeystoneIcon size={20} className="text-[#D4A574]" />
            <span className="text-[13px] font-semibold text-[#F5E6D3] tracking-tight">Keystone</span>
          </div>
          <h1 className="text-[20px] text-[#F5E6D3] font-semibold" style={{ fontFamily: "Georgia, serif" }}>
            {project?.name || "Project"}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#D4A574]/20 text-[#D4A574] rounded-full">
              {link?.contactRole}
            </span>
            <span className="text-[11px] text-[#D4A574]/60">
              {phaseName} phase · {project?.progress ?? 0}% complete
            </span>
          </div>
          <p className="text-[12px] text-[#D4A574]/50 mt-1">
            Logged in as {link?.contactName}
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#6A6A6A] font-medium">Project progress</span>
            <span className="text-[12px] font-bold text-[#2C1810] font-mono">{project?.progress ?? 0}%</span>
          </div>
          <div className="h-2 bg-[#e8e0d4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D6A4F] rounded-full transition-all"
              style={{ width: `${project?.progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <section>
          <h2 className="text-[14px] font-semibold text-[#2C1810] mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Your tasks ({pendingTasks.length} pending)
          </h2>
          {tasks.length === 0 ? (
            <p className="text-[12px] text-[#6A6A6A] py-4">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => task.id && handleComplete(task.id)}
                  disabled={completingTask === task.id}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-[#e8e0d4] rounded-xl text-left hover:bg-[#F5E6D3]/30 transition-colors"
                >
                  {completingTask === task.id ? (
                    <div className="w-5 h-5 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Circle size={20} className="text-[#D4A574] shrink-0" />
                  )}
                  <span className="text-[13px] text-[#2C1810]">{task.label}</span>
                </button>
              ))}
              {completedTasks.length > 0 && (
                <>
                  <p className="text-[10px] text-[#6A6A6A] uppercase tracking-wider mt-4 mb-2">Completed</p>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-[#F5E6D3]/30 border border-[#e8e0d4] rounded-xl opacity-60"
                    >
                      <CheckCircle2 size={20} className="text-[#2D6A4F] shrink-0" />
                      <span className="text-[13px] text-[#2C1810] line-through">{task.label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>

        {/* Recent activity */}
        {logs.length > 0 && (
          <section>
            <h2 className="text-[14px] font-semibold text-[#2C1810] mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Recent activity
            </h2>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-white border border-[#e8e0d4] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={12} className="text-[#6A6A6A]" />
                    <span className="text-[10px] text-[#6A6A6A]">
                      {log.date ? new Date(log.date).toLocaleDateString() : ""}
                      {log.weather ? ` · ${log.weather}` : ""}
                      {log.crew ? ` · ${log.crew} crew` : ""}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#3A3A3A] leading-relaxed">
                    {(log.content || "").slice(0, 200)}
                    {(log.content || "").length > 200 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <a
          href="https://keystonebuild.vercel.app"
          className="inline-flex items-center gap-1.5 text-[11px] text-[#6A6A6A] hover:text-[#8B4513] transition-colors"
        >
          <KeystoneIcon size={14} className="text-[#D4A574]" />
          Powered by Keystone
        </a>
      </footer>
    </div>
  );
}
