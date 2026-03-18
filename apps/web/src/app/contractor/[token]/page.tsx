"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  validateContractorToken,
  contractorSubmitTask,
  contractorStartTask,
  contractorAddComment,
  type ContractorLink,
} from "@/lib/services/contractor-service";
import type { ProjectData, TaskData } from "@/lib/services/project-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Play,
  Send, Camera, ChevronDown, ChevronUp, MessageCircle, X, MapPin, Lock,
} from "lucide-react";

const PHASE_NAMES = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];

export default function ContractorPage() {
  const params = useParams();
  const token = params.token as string;

  const [link, setLink] = useState<ContractorLink | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState("");
  const [taskPhotos, setTaskPhotos] = useState<Record<string, {url: string; latitude?: number; longitude?: number; timestamp: string}[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoTaskId, setActivePhotoTaskId] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handlePhotoUploadClick(taskId: string) {
    setActivePhotoTaskId(taskId);
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const taskId = activePhotoTaskId;
    if (!file || !taskId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const timestamp = new Date().toISOString();

      // Attempt GPS capture (non-blocking)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setTaskPhotos((prev) => ({
              ...prev,
              [taskId]: [
                ...(prev[taskId] || []),
                {
                  url: dataUrl,
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  timestamp,
                },
              ],
            }));
          },
          () => {
            // GPS failed — still store photo without coordinates
            setTaskPhotos((prev) => ({
              ...prev,
              [taskId]: [
                ...(prev[taskId] || []),
                { url: dataUrl, timestamp },
              ],
            }));
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        // No geolocation API — store without coordinates
        setTaskPhotos((prev) => ({
          ...prev,
          [taskId]: [
            ...(prev[taskId] || []),
            { url: dataUrl, timestamp },
          ],
        }));
      }
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-selected
    e.target.value = "";
  }

  function removePhoto(taskId: string, index: number) {
    setTaskPhotos((prev) => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter((_, i) => i !== index),
    }));
  }

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

        const projSnap = await get(ref(db, `users/${validated.userId}/projects/${validated.projectId}`));
        if (projSnap.exists()) {
          setProject({ id: validated.projectId, ...projSnap.val() });
        }

        const tasksSnap = await get(ref(db, `users/${validated.userId}/projects/${validated.projectId}/tasks`));
        if (tasksSnap.exists()) {
          const data = tasksSnap.val() as Record<string, TaskData>;
          // Only show tasks assigned to this contractor
          const myTasks = Object.entries(data)
            .map(([id, t]) => ({ ...t, id }))
            .filter((t) => t.assignedTo === validated.contactId || !t.assignedTo)
            .sort((a, b) => a.order - b.order);
          setTasks(myTasks);
        }
      } catch {
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleStart(taskId: string) {
    if (!link) return;
    setSubmitting(true);
    try {
      await contractorStartTask(token, link.userId, link.projectId, taskId);
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "in-progress" } : t));
      showToast("Task started.");
    } catch {
      showToast("Failed to start task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(task: TaskData) {
    if (!link || !task.id) return;
    const photos = taskPhotos[task.id] || [];
    if (task.requiresPhoto && photos.length === 0) {
      showToast("Photo proof is required for this task.");
      return;
    }
    setSubmitting(true);
    try {
      await contractorSubmitTask(
        token, link.userId, link.projectId, task.id,
        {
          completionNote: completionNote || undefined,
          completionPhotos: photos.map((p) => ({
            url: p.url,
            latitude: p.latitude,
            longitude: p.longitude,
            timestamp: p.timestamp,
          })),
        },
        task.requiresApproval ?? false
      );
      setTasks((prev) => prev.map((t) => t.id === task.id ? {
        ...t,
        status: task.requiresApproval ? "pending-review" : "done",
        done: !task.requiresApproval,
        completedBy: link.contactName,
        completedAt: new Date().toISOString(),
        completionNote,
      } : t));
      setCompletionNote("");
      setActiveTaskId(null);
      // Clear photos for this task after successful submit
      setTaskPhotos((prev) => {
        const next = { ...prev };
        delete next[task.id!];
        return next;
      });
      showToast(task.requiresApproval ? "Submitted for review." : "Task completed.");
    } catch {
      showToast("Failed to submit task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComment(taskId: string) {
    if (!link || !commentText.trim()) return;
    try {
      await contractorAddComment(token, link.userId, link.projectId, taskId, commentText.trim());
      setCommentText("");
      showToast("Comment sent.");
    } catch {
      showToast("Failed to send comment.");
    }
  }

  function isTaskBlocked(task: TaskData): { blocked: boolean; blockedBy: string[] } {
    if (!task.dependsOn || task.dependsOn.length === 0) return { blocked: false, blockedBy: [] };
    const incomplete = task.dependsOn
      .map(depId => tasks.find(t => t.id === depId))
      .filter(t => t && !t.done);
    return {
      blocked: incomplete.length > 0,
      blockedBy: incomplete.map(t => t!.label),
    };
  }

  // --- Error ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle size={48} className="text-[#BC6C25] mb-4" />
        <h1 className="text-[22px] text-[#2C1810] mb-2" style={{ fontFamily: "Georgia, serif" }}>
          Link unavailable
        </h1>
        <p className="text-[14px] text-[#6A6A6A] max-w-md">{error}</p>
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
  const todoTasks = tasks.filter((t) => t.status === "upcoming" || t.status === "rejected");
  const inProgress = tasks.filter((t) => t.status === "in-progress");
  const pendingReview = tasks.filter((t) => t.status === "pending-review");
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Hidden file input for photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#2D6A4F] text-white text-[13px] rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#2C1810] text-[#D4A574] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <KeystoneIcon size={20} className="text-[#D4A574]" />
            <span className="text-[13px] font-semibold text-[#F5E6D3]">Keystone</span>
          </div>
          <h1 className="text-[20px] text-[#F5E6D3] font-semibold" style={{ fontFamily: "Georgia, serif" }}>
            {project?.name || "Project"}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#D4A574]/20 text-[#D4A574] rounded-full">
              {link?.contactRole}
            </span>
            <span className="text-[11px] text-[#D4A574]/60">
              {phaseName} phase
            </span>
          </div>
          <p className="text-[12px] text-[#D4A574]/50 mt-1">{link?.contactName}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* --- To Do --- */}
        {todoTasks.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-[#2C1810] uppercase tracking-wider mb-3">
              To Do ({todoTasks.length})
            </h2>
            <div className="space-y-2">
              {todoTasks.map((task) => {
                const blockInfo = isTaskBlocked(task);
                return blockInfo.blocked ? (
                  <div key={task.id} className="bg-white border border-[#e8e0d4] rounded-xl p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-[#6A6A6A]/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#2C1810] font-medium">{task.label}</p>
                        <p className="text-[10px] text-[#6A6A6A] mt-0.5">Blocked by: {blockInfo.blockedBy.join(", ")}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <TaskCard
                    key={task.id}
                    task={task}
                    expanded={activeTaskId === task.id}
                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id!)}
                    onStart={() => handleStart(task.id!)}
                    submitting={submitting}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* --- In Progress --- */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-[#1B4965] uppercase tracking-wider mb-3">
              In Progress ({inProgress.length})
            </h2>
            <div className="space-y-2">
              {inProgress.map((task) => (
                <div key={task.id} className="bg-white border border-[#e8e0d4] rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id!)}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#1B4965] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#2C1810] font-medium">{task.label}</p>
                      {task.price && (
                        <p className="text-[11px] text-[#2D6A4F] font-mono">{task.currency ?? "$"}{task.price.toLocaleString()}</p>
                      )}
                      {task.rejectionReason && (
                        <p className="text-[11px] text-[#9B2226] mt-1">Returned: {task.rejectionReason}</p>
                      )}
                    </div>
                    {activeTaskId === task.id ? <ChevronUp size={16} className="text-[#6A6A6A]" /> : <ChevronDown size={16} className="text-[#6A6A6A]" />}
                  </button>

                  {activeTaskId === task.id && (
                    <div className="px-4 pb-4 border-t border-[#e8e0d4] space-y-3">
                      {task.description && (
                        <p className="text-[12px] text-[#6A6A6A] pt-3">{task.description}</p>
                      )}

                      <textarea
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        placeholder="Add a note about the work completed..."
                        className="w-full px-3 py-2 text-[12px] border border-[#e8e0d4] rounded-lg bg-white resize-none h-20 focus:outline-none focus:border-[#8B4513]"
                      />

                      {/* Photo upload section */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePhotoUploadClick(task.id!)}
                            className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium border border-[#e8e0d4] rounded-lg bg-white hover:bg-[#F5E6D3]/40 transition-colors"
                          >
                            <Camera size={16} className="text-[#8B4513]" />
                            Add photo
                          </button>
                          {(taskPhotos[task.id!] || []).length > 0 && (
                            <span className="text-[11px] text-[#2D6A4F] font-medium">
                              {(taskPhotos[task.id!] || []).length} photo{(taskPhotos[task.id!] || []).length !== 1 ? "s" : ""} attached
                            </span>
                          )}
                          {task.requiresPhoto && (taskPhotos[task.id!] || []).length === 0 && (
                            <span className="text-[11px] text-[#BC6C25] font-medium flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Photo required
                            </span>
                          )}
                        </div>

                        {/* Photo thumbnails */}
                        {(taskPhotos[task.id!] || []).length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {(taskPhotos[task.id!] || []).map((photo, idx) => (
                              <div key={idx} className="relative shrink-0 w-[60px] h-[60px] rounded-lg overflow-hidden border border-[#e8e0d4] group">
                                <img
                                  src={photo.url}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {/* GPS indicator */}
                                <div className={`absolute bottom-0 left-0 px-1 py-0.5 text-[8px] font-semibold ${photo.latitude != null ? "bg-[#2D6A4F]/80 text-white" : "bg-[#6A6A6A]/80 text-white"}`}>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin size={7} />
                                    {photo.latitude != null ? "GPS" : "No GPS"}
                                  </span>
                                </div>
                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => removePhoto(task.id!, idx)}
                                  className="absolute top-0 right-0 p-0.5 bg-[#9B2226]/80 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Comment thread */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Message the owner..."
                          className="flex-1 px-3 py-2 text-[12px] border border-[#e8e0d4] rounded-lg focus:outline-none focus:border-[#8B4513]"
                        />
                        <button
                          onClick={() => handleComment(task.id!)}
                          disabled={!commentText.trim()}
                          className="p-2 bg-[#2C1810] text-[#D4A574] rounded-lg hover:bg-[#3D2215] transition-colors disabled:opacity-30"
                        >
                          <MessageCircle size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleSubmit(task)}
                        disabled={submitting || (task.requiresPhoto === true && (taskPhotos[task.id!] || []).length === 0)}
                        className="w-full py-2.5 text-[13px] font-medium bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/90 transition-colors disabled:opacity-50"
                      >
                        {task.requiresPhoto && (taskPhotos[task.id!] || []).length === 0
                          ? "Photo proof required"
                          : submitting
                            ? "Submitting..."
                            : task.requiresApproval
                              ? "Submit for review"
                              : "Mark complete"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Pending Review --- */}
        {pendingReview.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-[#BC6C25] uppercase tracking-wider mb-3">
              Pending Review ({pendingReview.length})
            </h2>
            <div className="space-y-2">
              {pendingReview.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4 bg-[#fffbeb] border border-[#BC6C25]/20 rounded-xl">
                  <Clock size={18} className="text-[#BC6C25] shrink-0" />
                  <div>
                    <p className="text-[13px] text-[#2C1810] font-medium">{task.label}</p>
                    <p className="text-[10px] text-[#6A6A6A]">Waiting for owner approval</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Done --- */}
        {doneTasks.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-[#6A6A6A] uppercase tracking-wider mb-3">
              Completed ({doneTasks.length})
            </h2>
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-[#F5E6D3]/30 border border-[#e8e0d4] rounded-xl opacity-60">
                  <CheckCircle2 size={18} className="text-[#2D6A4F] shrink-0" />
                  <div>
                    <p className="text-[13px] text-[#2C1810] line-through">{task.label}</p>
                    {task.price && (
                      <p className="text-[10px] text-[#2D6A4F] font-mono">{task.currency ?? "$"}{task.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Empty --- */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <Circle size={32} className="text-[#D4A574] mx-auto mb-3" />
            <p className="text-[14px] text-[#6A6A6A]">No tasks assigned yet.</p>
            <p className="text-[12px] text-[#6A6A6A]/60 mt-1">Your project owner will assign tasks here.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <a href="https://keystonebuild.vercel.app" className="inline-flex items-center gap-1.5 text-[11px] text-[#6A6A6A] hover:text-[#8B4513] transition-colors">
          <KeystoneIcon size={14} className="text-[#D4A574]" />
          Powered by Keystone
        </a>
      </footer>
    </div>
  );
}

// --- Task Card (for To Do status) ---
function TaskCard({ task, expanded, onToggle, onStart, submitting }: {
  task: TaskData;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
  submitting: boolean;
}) {
  return (
    <div className="bg-white border border-[#e8e0d4] rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={onToggle}>
        <Circle size={18} className="text-[#D4A574] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#2C1810] font-medium">{task.label}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {task.price && (
              <span className="text-[10px] text-[#2D6A4F] font-mono">{task.currency ?? "$"}{task.price.toLocaleString()}</span>
            )}
            {task.dueDate && (
              <span className="text-[10px] text-[#6A6A6A]">Due {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            {task.requiresPhoto && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#BC6C25]/10 text-[#BC6C25] rounded-full">Photo required</span>
            )}
            {task.requiresApproval && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#1B4965]/10 text-[#1B4965] rounded-full">Needs approval</span>
            )}
            {task.priority === "urgent" && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#BC6C25]/10 text-[#BC6C25] rounded-full font-semibold">Urgent</span>
            )}
            {task.priority === "critical" && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#9B2226]/10 text-[#9B2226] rounded-full font-semibold">Critical</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-[#6A6A6A]" /> : <ChevronDown size={16} className="text-[#6A6A6A]" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#e8e0d4]">
          {task.description && (
            <p className="text-[12px] text-[#6A6A6A] pt-3 mb-3">{task.description}</p>
          )}
          <button
            onClick={onStart}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium bg-[#2C1810] text-[#F5E6D3] rounded-lg hover:bg-[#3D2215] transition-colors disabled:opacity-50"
          >
            <Play size={14} />
            {submitting ? "Starting..." : "Start task"}
          </button>
        </div>
      )}
    </div>
  );
}
