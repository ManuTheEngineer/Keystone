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

/* ── CSS Variables ── */
const cssVars: Record<string, string> = {
  "--bg": "#FDFBF7",
  "--card": "#FFFFFF",
  "--t1": "#2C1810",
  "--t2": "#5A5A5A",
  "--t3": "#9A9590",
  "--b1": "#E0D5C8",
  "--clay": "#8B4513",
  "--sand": "#D4A574",
  "--success": "#2D6A4F",
  "--success-bg": "#EDF7ED",
  "--warning": "#BC6C25",
  "--warning-bg": "#FFF8E7",
  "--danger": "#9B2226",
  "--danger-bg": "#FDEDED",
  "--info": "#1B4965",
  "--info-bg": "#E8F0F5",
};

/* ── Inline style helpers ── */
const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const serif: React.CSSProperties = { fontFamily: "'Georgia', 'Times New Roman', serif" };
const label: React.CSSProperties = {
  fontSize: 8, fontWeight: 500, textTransform: "uppercase",
  letterSpacing: "2px", color: "var(--t3)",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    "upcoming":       { bg: "var(--info-bg)",    color: "var(--info)",    text: "To do" },
    "rejected":       { bg: "var(--danger-bg)",  color: "var(--danger)",  text: "Returned" },
    "in-progress":    { bg: "var(--warning-bg)", color: "var(--warning)", text: "In progress" },
    "pending-review": { bg: "var(--warning-bg)", color: "var(--warning)", text: "Awaiting review" },
    "done":           { bg: "var(--success-bg)", color: "var(--success)", text: "Done" },
  };
  const s = map[status] || map["upcoming"];
  return (
    <span style={{
      fontSize: 8, fontWeight: 500, padding: "2px 8px", borderRadius: 12,
      background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      {s.text}
    </span>
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 8, marginTop: 16,
    }}>
      <span style={{ ...label, flexShrink: 0 }}>
        {children}{count != null ? ` (${count})` : ""}
      </span>
      <span style={{ flex: 1, height: 0.5, background: "var(--b1)" }} />
    </div>
  );
}

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
  const [taskPhotos, setTaskPhotos] = useState<Record<string, { url: string; latitude?: number; longitude?: number; timestamp: string }[]>>({});
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

  // NOTE: Photos stored as base64 data URLs in Firebase. For production,
  // migrate to S3/R2 persistent storage via vault-upload-service.
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const taskId = activePhotoTaskId;
    if (!file || !taskId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const timestamp = new Date().toISOString();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            let lat: number | undefined = position.coords.latitude;
            let lon: number | undefined = position.coords.longitude;
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
              // Invalid coordinates, treat as no GPS
              lat = undefined;
              lon = undefined;
            }
            setTaskPhotos((prev) => ({
              ...prev,
              [taskId]: [
                ...(prev[taskId] || []),
                {
                  url: dataUrl,
                  latitude: lat,
                  longitude: lon,
                  timestamp,
                },
              ],
            }));
          },
          () => {
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
          const myTasks = Object.entries(data)
            .map(([id, t]) => ({ ...t, id }))
            .filter((t) => t.assignedTo === validated.contactId)
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

  function isTaskBlocked(task: TaskData, allTasks: TaskData[]): { blocked: boolean; blockedBy: string[] } {
    if (!task.dependsOn || task.dependsOn.length === 0) return { blocked: false, blockedBy: [] };
    const incomplete = task.dependsOn
      .map(depId => allTasks.find(t => t.id === depId))
      .filter((t): t is TaskData => t != null && !t.done);
    return {
      blocked: incomplete.length > 0,
      blockedBy: incomplete.map(t => t.label),
    };
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{
        ...cssVarsAsStyle(),
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "0 24px", textAlign: "center",
      }}>
        <AlertTriangle size={36} style={{ color: "var(--warning)", marginBottom: 12 }} />
        <h1 style={{ ...serif, fontSize: 18, color: "var(--t1)", marginBottom: 6 }}>
          Link unavailable
        </h1>
        <p style={{ fontSize: 12, color: "var(--t2)", maxWidth: 320 }}>{error}</p>
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={{
        ...cssVarsAsStyle(),
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 20, height: 20,
          border: "2px solid var(--clay)", borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.6s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const phaseName = PHASE_NAMES[project?.currentPhase ?? 0] || "Build";

  /* ── Task groups ── */
  const todoTasks = tasks.filter((t) => t.status === "upcoming" || t.status === "rejected");
  const inProgress = tasks.filter((t) => t.status === "in-progress");
  const pendingReview = tasks.filter((t) => t.status === "pending-review");
  const doneTasks = tasks.filter((t) => t.done);

  /* ── Summary stats ── */
  const totalTasks = tasks.length;
  const completedCount = doneTasks.length;
  const pendingCount = todoTasks.length + inProgress.length + pendingReview.length;
  const earnings = doneTasks.reduce((sum, t) => sum + (t.price || 0), 0);
  const currency = tasks[0]?.currency ?? "$";

  return (
    <div style={{ ...cssVarsAsStyle(), minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, padding: "6px 16px", background: "var(--success)",
          color: "#fff", fontSize: 11, borderRadius: 6,
          boxShadow: "0 4px 12px rgba(0,0,0,.15)",
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background: "var(--t1)", color: "var(--sand)",
        padding: "0 16px", maxHeight: 80,
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 0" }}>
          {/* Top row: logo + project name */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <KeystoneIcon size={16} className="text-[#D4A574]" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#F5E6D3" }}>Keystone</span>
            </div>
            <span style={{
              ...serif, fontSize: 14, color: "#F5E6D3", fontWeight: 400,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: 220, textAlign: "right",
            }}>
              {project?.name || "Project"}
            </span>
          </div>
          {/* Bottom row: contractor info */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 11, color: "var(--sand)", opacity: 0.7 }}>
              {link?.contactName}
            </span>
            <span style={{
              fontSize: 8, fontWeight: 500, padding: "2px 8px", borderRadius: 12,
              background: "rgba(212,165,116,0.15)", color: "var(--sand)",
              textTransform: "uppercase", letterSpacing: "1px",
            }}>
              {link?.contactRole}
            </span>
            <span style={{ fontSize: 9, color: "var(--sand)", opacity: 0.4 }}>
              {phaseName} phase
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "12px 12px 24px" }}>

        {/* ── Summary Stats Grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
          marginBottom: 8,
        }}>
          {[
            { value: totalTasks, lbl: "My tasks" },
            { value: completedCount, lbl: "Completed" },
            { value: pendingCount, lbl: "Pending" },
            { value: `${currency}${earnings.toLocaleString()}`, lbl: "Earnings" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, padding: 10, textAlign: "center",
            }}>
              <div style={{ ...mono, fontSize: 15, fontWeight: 500, color: "var(--t1)" }}>
                {s.value}
              </div>
              <div style={{ ...label, marginTop: 3, fontSize: 8 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* ── To Do ── */}
        {todoTasks.length > 0 && (
          <section>
            <SectionLabel count={todoTasks.length}>To do</SectionLabel>
            <div style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, overflow: "hidden",
            }}>
              {todoTasks.map((task, idx) => {
                const blockInfo = isTaskBlocked(task, tasks);
                const isExpanded = activeTaskId === task.id;
                const isLast = idx === todoTasks.length - 1;

                if (blockInfo.blocked) {
                  return (
                    <div key={task.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "0 12px", height: 32, opacity: 0.4,
                      borderBottom: isLast ? "none" : "1px solid var(--b1)",
                    }}>
                      <Lock size={12} style={{ color: "var(--t3)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.label}
                      </span>
                      <span style={{ fontSize: 8, color: "var(--t3)", whiteSpace: "nowrap" }}>
                        Blocked
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={task.id}>
                    <button
                      onClick={() => setActiveTaskId(isExpanded ? null : task.id!)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "0 12px", height: 32, width: "100%",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderBottom: (isLast && !isExpanded) ? "none" : "1px solid var(--b1)",
                        textAlign: "left",
                      }}
                    >
                      <Circle size={13} style={{ color: "var(--sand)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.label}
                      </span>
                      {task.price != null && (
                        <span style={{ ...mono, fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>
                          {task.currency ?? "$"}{task.price.toLocaleString()}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ ...mono, fontSize: 9, color: "var(--t3)", flexShrink: 0 }}>
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      )}
                      <StatusBadge status={task.status} />
                      {isExpanded
                        ? <ChevronUp size={12} style={{ color: "var(--t3)" }} />
                        : <ChevronDown size={12} style={{ color: "var(--t3)" }} />
                      }
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <TaskExpandedToDo
                        task={task}
                        submitting={submitting}
                        onStart={() => handleStart(task.id!)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── In Progress ── */}
        {inProgress.length > 0 && (
          <section>
            <SectionLabel count={inProgress.length}>In progress</SectionLabel>
            <div style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, overflow: "hidden",
            }}>
              {inProgress.map((task, idx) => {
                const isExpanded = activeTaskId === task.id;
                const isLast = idx === inProgress.length - 1;
                const photos = taskPhotos[task.id!] || [];

                return (
                  <div key={task.id}>
                    <button
                      onClick={() => setActiveTaskId(isExpanded ? null : task.id!)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "0 12px", height: 32, width: "100%",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderBottom: (isLast && !isExpanded) ? "none" : "1px solid var(--b1)",
                        textAlign: "left",
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "var(--info)", flexShrink: 0,
                      }} />
                      <span style={{ flex: 1, fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.label}
                      </span>
                      {task.price != null && (
                        <span style={{ ...mono, fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>
                          {task.currency ?? "$"}{task.price.toLocaleString()}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ ...mono, fontSize: 9, color: "var(--t3)", flexShrink: 0 }}>
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      )}
                      <StatusBadge status={task.status} />
                      {isExpanded
                        ? <ChevronUp size={12} style={{ color: "var(--t3)" }} />
                        : <ChevronDown size={12} style={{ color: "var(--t3)" }} />
                      }
                    </button>

                    {/* Expanded detail for in-progress tasks */}
                    {isExpanded && (
                      <div style={{
                        padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid var(--b1)",
                        background: "var(--bg)",
                      }}>
                        {/* Description */}
                        {task.description && (
                          <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 8 }}>
                            {task.description}
                          </p>
                        )}

                        {/* Rejection reason */}
                        {task.rejectionReason && (
                          <div style={{
                            fontSize: 10, color: "var(--danger)", background: "var(--danger-bg)",
                            padding: "4px 8px", borderRadius: 4, marginBottom: 8,
                          }}>
                            Returned: {task.rejectionReason}
                          </div>
                        )}

                        {/* Requirement badges */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                          {task.requiresPhoto && (
                            <span style={{
                              fontSize: 8, fontWeight: 500, padding: "2px 6px", borderRadius: 10,
                              background: "var(--warning-bg)", color: "var(--warning)",
                            }}>Photo required</span>
                          )}
                          {task.requiresApproval && (
                            <span style={{
                              fontSize: 8, fontWeight: 500, padding: "2px 6px", borderRadius: 10,
                              background: "var(--info-bg)", color: "var(--info)",
                            }}>Needs approval</span>
                          )}
                          {(task.priority === "urgent" || task.priority === "critical") && (
                            <span style={{
                              fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 10,
                              background: task.priority === "critical" ? "var(--danger-bg)" : "var(--warning-bg)",
                              color: task.priority === "critical" ? "var(--danger)" : "var(--warning)",
                            }}>
                              {task.priority === "critical" ? "Critical" : "Urgent"}
                            </span>
                          )}
                        </div>

                        {/* Photo upload */}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handlePhotoUploadClick(task.id!)}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                padding: "4px 10px", fontSize: 9, fontWeight: 500,
                                border: "1px solid var(--b1)", borderRadius: 4,
                                background: "var(--card)", cursor: "pointer",
                                color: "var(--t1)",
                              }}
                            >
                              <Camera size={12} style={{ color: "var(--clay)" }} />
                              Add photo
                            </button>
                            {photos.length > 0 && (
                              <span style={{ fontSize: 9, color: "var(--success)", fontWeight: 500 }}>
                                {photos.length} attached
                              </span>
                            )}
                            {task.requiresPhoto && photos.length === 0 && (
                              <span style={{ fontSize: 9, color: "var(--warning)", display: "flex", alignItems: "center", gap: 2 }}>
                                <AlertTriangle size={10} /> Required
                              </span>
                            )}
                          </div>

                          {/* Photo thumbnails */}
                          {photos.length > 0 && (
                            <div style={{ display: "flex", gap: 4, marginTop: 6, overflowX: "auto" }}>
                              {photos.map((photo, idx) => (
                                <div key={idx} style={{
                                  position: "relative", flexShrink: 0, width: 50, height: 50,
                                  borderRadius: 4, overflow: "hidden", border: "1px solid var(--b1)",
                                }}>
                                  <img
                                    src={photo.url}
                                    alt={`Photo ${idx + 1}`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                  <div style={{
                                    position: "absolute", bottom: 0, left: 0,
                                    padding: "1px 3px", fontSize: 7, fontWeight: 600,
                                    background: photo.latitude != null ? "rgba(45,106,79,0.8)" : "rgba(106,106,106,0.8)",
                                    color: "#fff",
                                  }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <MapPin size={6} />
                                      {photo.latitude != null ? "GPS" : "No GPS"}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(task.id!, idx)}
                                    style={{
                                      position: "absolute", top: 0, right: 0,
                                      padding: 2, background: "rgba(155,34,38,0.8)",
                                      color: "#fff", border: "none", cursor: "pointer",
                                      borderBottomLeftRadius: 4, lineHeight: 0,
                                    }}
                                  >
                                    <X size={8} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Completion note */}
                        <input
                          type="text"
                          value={completionNote}
                          onChange={(e) => setCompletionNote(e.target.value)}
                          placeholder="Completion note..."
                          style={{
                            width: "100%", padding: "5px 8px", fontSize: 10,
                            border: "1px solid var(--b1)", borderRadius: 4,
                            background: "var(--card)", outline: "none",
                            color: "var(--t1)", marginBottom: 6,
                          }}
                        />

                        {/* Existing comments */}
                        {task.comments && Object.keys(task.comments).length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ ...label, fontSize: 8, display: "block", marginBottom: 4 }}>Comments</span>
                            <div style={{
                              display: "flex", flexDirection: "column", gap: 4,
                              maxHeight: 120, overflowY: "auto",
                            }}>
                              {Object.entries(task.comments as unknown as Record<string, { content?: string; text?: string; authorName?: string; author?: string; createdAt: string }>)
                                .sort(([, a], [, b]) => (a.createdAt || "").localeCompare(b.createdAt || ""))
                                .map(([cId, c]) => (
                                  <div key={cId} style={{
                                    padding: "4px 8px", borderRadius: 4,
                                    background: "var(--card)", border: "1px solid var(--b1)",
                                  }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                      <span style={{ fontSize: 9, fontWeight: 600, color: "var(--t1)" }}>{c.authorName || c.author}</span>
                                      {c.createdAt && (
                                        <span style={{ ...mono, fontSize: 8, color: "var(--t3)" }}>
                                          {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                        </span>
                                      )}
                                    </div>
                                    <p style={{ fontSize: 10, color: "var(--t2)", lineHeight: 1.4, margin: 0 }}>{c.content || c.text}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Comment input */}
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Message the owner..."
                            style={{
                              flex: 1, padding: "5px 8px", fontSize: 10,
                              border: "1px solid var(--b1)", borderRadius: 4,
                              outline: "none", color: "var(--t1)",
                              background: "var(--card)",
                            }}
                          />
                          <button
                            onClick={() => handleComment(task.id!)}
                            disabled={!commentText.trim()}
                            style={{
                              padding: "4px 8px", background: "var(--t1)",
                              color: "var(--sand)", border: "none", borderRadius: 4,
                              cursor: commentText.trim() ? "pointer" : "default",
                              opacity: commentText.trim() ? 1 : 0.3,
                              lineHeight: 0,
                            }}
                          >
                            <MessageCircle size={11} />
                          </button>
                        </div>

                        {/* Submit button */}
                        <button
                          onClick={() => handleSubmit(task)}
                          disabled={submitting || (task.requiresPhoto === true && photos.length === 0)}
                          style={{
                            width: "100%", padding: "6px 0", fontSize: 9,
                            fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px",
                            background: "var(--success)", color: "#fff",
                            border: "none", borderRadius: 4, cursor: "pointer",
                            opacity: (submitting || (task.requiresPhoto === true && photos.length === 0)) ? 0.5 : 1,
                          }}
                        >
                          {task.requiresPhoto && photos.length === 0
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
                );
              })}
            </div>
          </section>
        )}

        {/* ── Awaiting Review ── */}
        {pendingReview.length > 0 && (
          <section>
            <SectionLabel count={pendingReview.length}>Awaiting review</SectionLabel>
            <div style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, overflow: "hidden",
            }}>
              {pendingReview.map((task, idx) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "0 12px", height: 32,
                  borderBottom: idx === pendingReview.length - 1 ? "none" : "1px solid var(--b1)",
                }}>
                  <Clock size={12} style={{ color: "var(--warning)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.label}
                  </span>
                  {task.price != null && (
                    <span style={{ ...mono, fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>
                      {task.currency ?? "$"}{task.price.toLocaleString()}
                    </span>
                  )}
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Completed ── */}
        {doneTasks.length > 0 && (
          <section>
            <SectionLabel count={doneTasks.length}>Completed</SectionLabel>
            <div style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, overflow: "hidden",
            }}>
              {doneTasks.map((task, idx) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "0 12px", height: 32, opacity: 0.45,
                  borderBottom: idx === doneTasks.length - 1 ? "none" : "1px solid var(--b1)",
                }}>
                  <CheckCircle2 size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: 11, color: "var(--t2)",
                    textDecoration: "line-through",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {task.label}
                  </span>
                  {task.price != null && (
                    <span style={{ ...mono, fontSize: 10, color: "var(--success)", flexShrink: 0 }}>
                      {task.currency ?? "$"}{task.price.toLocaleString()}
                    </span>
                  )}
                  <StatusBadge status="done" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Circle size={24} style={{ color: "var(--sand)", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 12, color: "var(--t2)" }}>No tasks assigned yet.</p>
            <p style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
              Your project owner will assign tasks here.
            </p>
          </div>
        )}

        {/* ── Recent activity placeholder ── */}
        {tasks.length > 0 && (
          <section>
            <SectionLabel>Recent updates</SectionLabel>
            <div style={{
              background: "var(--card)", border: "1px solid var(--b1)",
              borderRadius: 8, padding: "0 12px", overflow: "hidden",
            }}>
              {doneTasks.slice(0, 5).map((task, idx) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  height: 28,
                  borderBottom: idx === Math.min(doneTasks.length, 5) - 1 ? "none" : "1px solid var(--b1)",
                }}>
                  <span style={{ ...mono, fontSize: 9, color: "var(--t3)", flexShrink: 0 }}>
                    {task.completedAt
                      ? new Date(task.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "--"
                    }
                  </span>
                  <CheckCircle2 size={10} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: 10, color: "var(--t2)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {task.label}
                  </span>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <div style={{ height: 28, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--t3)" }}>No recent activity</span>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: "16px 0", textAlign: "center" }}>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 9, color: "var(--t3)", textDecoration: "none",
          }}
        >
          <KeystoneIcon size={11} className="text-[#D4A574]" />
          Powered by Keystone
        </a>
      </footer>
    </div>
  );
}

/* ── Expanded "To Do" task detail ── */
function TaskExpandedToDo({ task, submitting, onStart }: {
  task: TaskData;
  submitting: boolean;
  onStart: () => void;
}) {
  return (
    <div style={{
      padding: "10px 12px", borderBottom: "1px solid var(--b1)",
      background: "var(--bg)",
    }}>
      {task.description && (
        <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 8 }}>
          {task.description}
        </p>
      )}

      {/* Requirement badges */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {task.requiresPhoto && (
          <span style={{
            fontSize: 8, fontWeight: 500, padding: "2px 6px", borderRadius: 10,
            background: "var(--warning-bg)", color: "var(--warning)",
          }}>Photo required</span>
        )}
        {task.requiresApproval && (
          <span style={{
            fontSize: 8, fontWeight: 500, padding: "2px 6px", borderRadius: 10,
            background: "var(--info-bg)", color: "var(--info)",
          }}>Needs approval</span>
        )}
        {(task.priority === "urgent" || task.priority === "critical") && (
          <span style={{
            fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 10,
            background: task.priority === "critical" ? "var(--danger-bg)" : "var(--warning-bg)",
            color: task.priority === "critical" ? "var(--danger)" : "var(--warning)",
          }}>
            {task.priority === "critical" ? "Critical" : "Urgent"}
          </span>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={submitting}
        style={{
          width: "100%", padding: "6px 0", fontSize: 9,
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          background: "var(--t1)", color: "#F5E6D3",
          border: "none", borderRadius: 4, cursor: "pointer",
          opacity: submitting ? 0.5 : 1,
        }}
      >
        <Play size={10} />
        {submitting ? "Starting..." : "Start task"}
      </button>
    </div>
  );
}

/* ── Helper: convert cssVars map to inline style ── */
function cssVarsAsStyle(): React.CSSProperties {
  return cssVars as unknown as React.CSSProperties;
}
