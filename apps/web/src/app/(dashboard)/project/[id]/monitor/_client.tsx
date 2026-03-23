"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NextImage from "next/image";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToPhotos,
  subscribeToDailyLogs,
  subscribeToBudgetItems,
  subscribeToMaterials,
  subscribeToContacts,
  subscribeToTasks,
  subscribeToPunchListItems,
  addMaterial,
  updateMaterial,
  type ProjectData,
  type PhotoData,
  type DailyLogData,
  type BudgetItemData,
  type MaterialData,
  type ContactData,
  type TaskData,
  type PunchListItemData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
// Badge import removed — not used on this page
import {
  getMarketData,
  getPhaseDefinition,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, MilestoneDefinition } from "@keystone/market-data";
import { usePWA } from "@/lib/hooks/use-pwa";
import { openPresentation, type PresentationData } from "@/lib/services/presentation-service";
import {
  Eye,
  MapPin,
  Clock,
  Camera,
  Check,
  Circle,
  FileText,
  DollarSign,
  Package,
  Plus,
  X,
  AlertTriangle,
  Send,
  Wifi,
  WifiOff,
  Calendar,
  Users,
  Image,
  TrendingUp,
  ClipboardList,
  Video,
  Settings,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { ref, get, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

// ---------------------------------------------------------------------------
// Live Camera Feed
// ---------------------------------------------------------------------------

interface CameraConfig {
  id: string;
  name: string;
  url: string;
  type: "iframe" | "hls" | "image";
  addedAt: string;
}

function LiveCameraFeed({ projectId, userId }: { projectId: string; userId: string }) {
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"iframe" | "hls" | "image">("iframe");
  const [activeCamera, setActiveCamera] = useState(0);
  const { showToast } = useToast();

  // Load cameras from Firebase
  useEffect(() => {
    if (!userId || !projectId) return;
    get(ref(db, `users/${userId}/projects/${projectId}/cameras`)).then((snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v }));
        setCameras(list);
      }
    }).catch(() => {});
  }, [userId, projectId]);

  async function addCamera() {
    if (!newName.trim() || !newUrl.trim() || !userId) return;
    const id = `cam_${Date.now()}`;
    const cam: CameraConfig = { id, name: newName.trim(), url: newUrl.trim(), type: newType, addedAt: new Date().toISOString() };
    try {
      await set(ref(db, `users/${userId}/projects/${projectId}/cameras/${id}`), cam);
      setCameras((prev) => [...prev, cam]);
      setNewName("");
      setNewUrl("");
      setShowSetup(false);
      showToast("Camera added", "success");
    } catch { showToast("Failed to add camera", "error"); }
  }

  async function removeCamera(camId: string) {
    try {
      await set(ref(db, `users/${userId}/projects/${projectId}/cameras/${camId}`), null);
      setCameras((prev) => prev.filter((c) => c.id !== camId));
      setActiveCamera((prev) => prev >= cameras.length - 2 ? 0 : prev);
      showToast("Camera removed", "success");
    } catch { showToast("Failed to remove", "error"); }
  }

  const cam = cameras[activeCamera];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Video size={14} className="text-clay" />
          <span className="text-[11px] font-medium text-earth">Live site cameras</span>
          {cameras.length > 0 && (
            <span className="text-[9px] font-data text-muted">{cameras.length} camera{cameras.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <button onClick={() => setShowSetup(!showSetup)} className="text-[10px] text-clay hover:text-earth transition-colors flex items-center gap-1">
          <Settings size={11} />
          {cameras.length === 0 ? "Set up camera" : "Manage"}
        </button>
      </div>

      {/* Setup panel */}
      {showSetup && (
        <div className="p-3 bg-surface border border-border/40 rounded-lg mb-3">
          <p className="text-[10px] font-medium text-earth mb-2">Add a camera</p>
          <p className="text-[9px] text-muted mb-3">
            Connect an IP camera, webcam service, or any live stream URL from your construction site.
            Works with Wyze, Ring, Reolink, Nest, or any camera that provides a web URL.
          </p>

          <div className="grid grid-cols-[1fr_2fr] gap-2 mb-2">
            <div>
              <label className="block text-[8px] text-muted mb-0.5">Camera name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Front of site"
                className="w-full px-2 py-1.5 text-[10px] border border-border rounded bg-white text-earth focus:outline-none focus:border-clay/40" />
            </div>
            <div>
              <label className="block text-[8px] text-muted mb-0.5">Stream or embed URL</label>
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://camera-service.com/live/your-feed"
                className="w-full px-2 py-1.5 text-[10px] border border-border rounded bg-white text-earth focus:outline-none focus:border-clay/40 font-data" />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-[8px] text-muted">Feed type:</label>
            {([
              { value: "iframe" as const, label: "Web page / embed" },
              { value: "image" as const, label: "Snapshot URL (auto-refresh)" },
              { value: "hls" as const, label: "HLS stream (.m3u8)" },
            ]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-1 text-[9px] text-earth cursor-pointer">
                <input type="radio" name="camType" value={opt.value} checked={newType === opt.value} onChange={() => setNewType(opt.value)}
                  className="w-3 h-3 accent-clay" />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={addCamera} disabled={!newName.trim() || !newUrl.trim()}
              className="px-3 py-1.5 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 disabled:opacity-40 transition-colors">
              Add camera
            </button>
            <button onClick={() => setShowSetup(false)} className="text-[10px] text-muted hover:text-earth">Cancel</button>
          </div>

          {/* Existing cameras list */}
          {cameras.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <p className="text-[8px] text-muted uppercase tracking-wider mb-1">Your cameras</p>
              {cameras.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1 text-[10px]">
                  <span className="text-earth">{c.name}</span>
                  <button onClick={() => removeCamera(c.id)} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live feed display */}
      {cameras.length > 0 && cam && (
        <div className="bg-[#1a1714] rounded-lg overflow-hidden">
          {/* Camera selector tabs */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-1 px-2 pt-2">
              {cameras.map((c, i) => (
                <button key={c.id} onClick={() => setActiveCamera(i)}
                  className={`px-2 py-0.5 text-[9px] rounded transition-colors ${i === activeCamera ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Feed */}
          <div className="aspect-video relative">
            {cam.type === "iframe" && (
              <iframe src={cam.url} className="w-full h-full border-0" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin" />
            )}
            {cam.type === "image" && (
              <AutoRefreshImage src={cam.url} interval={10000} />
            )}
            {cam.type === "hls" && (
              <div className="flex items-center justify-center h-full text-white/50 text-[11px]">
                <p>HLS stream: <a href={cam.url} target="_blank" rel="noopener noreferrer" className="underline text-clay">{cam.url}</a></p>
              </div>
            )}
          </div>

          {/* Feed footer */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] text-white/50">{cam.name}</span>
            </div>
            <a href={cam.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-white/30 hover:text-white/60 flex items-center gap-1">
              <ExternalLink size={9} /> Open in new tab
            </a>
          </div>
        </div>
      )}

      {/* Empty state — friendly setup guide */}
      {cameras.length === 0 && !showSetup && (
        <div className="p-4 bg-surface border border-dashed border-sand/50 rounded-lg text-center">
          <Video size={20} className="mx-auto text-sand mb-2" />
          <p className="text-[11px] text-earth mb-1">Monitor your site in real time</p>
          <p className="text-[9px] text-muted mb-3 max-w-xs mx-auto">
            Connect a camera from your construction site to watch progress live.
            Works with any IP camera, Ring, Wyze, Reolink, or webcam service.
          </p>
          <button onClick={() => setShowSetup(true)}
            className="px-3 py-1.5 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 transition-colors">
            Connect a camera
          </button>
        </div>
      )}
    </div>
  );
}

function AutoRefreshImage({ src, interval }: { src: string; interval: number }) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setKey((k) => k + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return (
    <NextImage key={key} src={`${src}${src.includes("?") ? "&" : "?"}t=${key}`} alt="Live camera" width={640} height={480} className="w-full h-full object-contain bg-black" unoptimized />
  );
}

// --- Photo Feed Section ---

interface PhotoFeedProps {
  photos: PhotoData[];
  projectId: string;
  project: ProjectData;
  contacts: ContactData[];
}

function PhotoFeed({ photos, projectId, project, contacts }: PhotoFeedProps) {
  const { showToast } = useToast();
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">("all");

  const now = new Date();
  const filtered = photos.filter((p) => {
    if (dateFilter === "all") return true;
    const photoDate = new Date(p.date);
    const diffDays = (now.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24);
    if (dateFilter === "week") return diffDays <= 7;
    if (dateFilter === "month") return diffDays <= 30;
    return true;
  });

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Photo evidence feed</SectionLabel>
        <div className="flex items-center gap-1.5">
          {(["all", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                dateFilter === f
                  ? "bg-earth text-warm"
                  : "text-muted hover:bg-surface-alt"
              }`}
            >
              {f === "all" ? "All" : f === "week" ? "7d" : "30d"}
            </button>
          ))}
        </div>
      </div>

      {/* TODO: Replace inline empty state below with shared <EmptyState> component for consistency */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted">
          <Camera size={24} className="mb-2 opacity-40" />
          <p className="text-[11px]">No photos for this period</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-stagger">
          {filtered.slice(0, 12).map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-[var(--radius)] overflow-hidden border border-border bg-surface-alt aspect-square cursor-pointer hover:border-sand transition-colors"
            >
              {/* Photo thumbnail or placeholder */}
              {photo.fileUrl ? (
                <img
                  src={photo.fileUrl}
                  alt={photo.caption || "Construction photo"}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-warm/30">
                  <Image size={20} className="text-muted/40" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth/80 to-transparent p-2 pt-6">
                <p className="text-[9px] text-warm/90 truncate">{photo.caption || "Untitled"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-sand/60 flex items-center gap-0.5">
                    <Clock size={8} />
                    {photo.date}
                  </span>
                  {photo.latitude != null && photo.longitude != null && (
                    <span className="text-[8px] text-sand/60 flex items-center gap-0.5">
                      <MapPin size={8} />
                      GPS
                    </span>
                  )}
                </div>
              </div>

              {/* Phase badge */}
              {photo.phase && (
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-earth/70 text-warm backdrop-blur-sm">
                    {photo.phase}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 12 && (
        <p className="text-[10px] text-muted text-center mt-2">
          Showing 12 of {filtered.length} photos
        </p>
      )}

      <button
        onClick={() => {
          const msg = encodeURIComponent(
            `Hi, could you send updated construction photos for the ${project.name} project? Please include photos of current progress on site. Thank you!`
          );
          // Try WhatsApp first, fall back to email compose
          const firstContact = contacts.find((c) => c.whatsapp || c.phone);
          if (firstContact?.whatsapp || firstContact?.phone) {
            const num = (firstContact.whatsapp || firstContact.phone || "").replace(/\D/g, "");
            window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
          } else if (firstContact?.email) {
            window.open(`mailto:${firstContact.email}?subject=Photo Update Request - ${project.name}&body=${msg}`, "_blank");
          } else {
            // Copy message to clipboard as fallback
            navigator.clipboard.writeText(decodeURIComponent(msg));
            showToast("Message copied to clipboard", "success");
          }
        }}
        className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius)] border border-sand/40 text-[11px] text-earth hover:bg-warm/50 transition-colors"
      >
        <Send size={12} />
        Request photo update
      </button>
      <p className="text-[9px] text-muted text-center mt-1">
        {contacts.length > 0 ? "Opens WhatsApp or email to your primary contact" : "Add a contact in Team to enable requests"}
      </p>
    </Card>
  );
}

// --- Milestone Payment Tracker ---

interface MilestoneTrackerProps {
  milestones: MilestoneDefinition[];
  photos: PhotoData[];
  totalBudget: number;
  currency: string;
}

type MilestonePaymentStatus = "not-started" | "photo-pending" | "verified";

function MilestonePaymentTracker({ milestones, photos, totalBudget, currency }: MilestoneTrackerProps) {
  // Derive status from photos: if milestone has matching photos, it is verified
  const paymentMilestones = milestones.filter((m) => m.requiresPayment && m.paymentPct);

  const getStatus = (milestone: MilestoneDefinition): MilestonePaymentStatus => {
    // Check if any photo caption references this milestone (case-insensitive)
    const hasPhoto = photos.some(
      (p) => p.caption?.toLowerCase().includes(milestone.name.toLowerCase())
    );
    if (hasPhoto) return "verified";
    // If the milestone appears in the list but has no photo evidence, it is photo-pending
    // We cannot determine if a milestone is "reached" without explicit data, so default to not-started
    return "not-started";
  };

  const statusIcon = (status: MilestonePaymentStatus) => {
    switch (status) {
      case "verified":
        return <Check size={12} className="text-emerald-500" />;
      case "photo-pending":
        return <Clock size={12} className="text-warning" />;
      case "not-started":
        return <Circle size={12} className="text-muted/40" />;
    }
  };

  const statusLabel = (status: MilestonePaymentStatus) => {
    switch (status) {
      case "verified": return "Verified";
      case "photo-pending": return "Photo pending";
      case "not-started": return "Not started";
    }
  };

  const totalVerified = paymentMilestones
    .filter((m) => getStatus(m) === "verified")
    .reduce((sum, m) => sum + (m.paymentPct ?? 0), 0);
  const totalRemaining = 100 - totalVerified;

  const formatCurrency = (amount: number) => {
    if (currency === "XOF" || currency === "CFA") {
      return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
    }
    return `$${Math.round(amount).toLocaleString("en-US")}`;
  };

  return (
    <Card padding="md">
      <SectionLabel>Milestone payment tracker</SectionLabel>

      {paymentMilestones.length === 0 ? (
        <p className="text-[11px] text-muted py-4 text-center">No payment milestones defined for this phase</p>
      ) : (
        <>
          <div className="space-y-1.5 mb-3">
            {paymentMilestones.map((m, i) => {
              const status = getStatus(m);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 py-2 px-2.5 rounded text-[11px] ${
                    status === "verified" ? "bg-emerald-50" : ""
                  }`}
                >
                  {statusIcon(status)}
                  <span className="flex-1 text-foreground truncate">{m.name}</span>
                  <span className="text-[10px] font-data text-muted shrink-0">
                    {m.paymentPct}%
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    status === "verified" ? "bg-emerald-100 text-emerald-700" :
                    status === "photo-pending" ? "bg-warning/10 text-warning" :
                    "bg-muted/10 text-muted"
                  }`}>
                    {statusLabel(status)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className="border-t border-border pt-2.5">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-success font-medium">Verified: {totalVerified}%</span>
              <span className="text-muted">Remaining: {totalRemaining}%</span>
            </div>
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${totalVerified}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted mt-1">
              <span>{formatCurrency(totalBudget * totalVerified / 100)}</span>
              <span>{formatCurrency(totalBudget * totalRemaining / 100)}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// --- Weekly Summary ---

interface WeeklySummaryProps {
  logs: DailyLogData[];
  photos: PhotoData[];
  budgetItems: BudgetItemData[];
  project: ProjectData;
}

function WeeklySummary({ logs, photos, budgetItems, project }: WeeklySummaryProps) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekLogs = logs.filter((l) => new Date(l.createdAt ?? l.date) >= weekAgo);
  const weekPhotos = photos.filter((p) => new Date(p.date) >= weekAgo);
  const totalCrew = weekLogs.reduce((sum, l) => sum + (l.crew || 0), 0);
  const weekSpent = budgetItems.reduce((sum, b) => sum + Number(b.actual || 0), 0);

  const formatCurrency = (amount: number) => {
    if (project.currency === "XOF" || project.currency === "CFA") {
      return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
    }
    return `$${Math.round(amount).toLocaleString("en-US")}`;
  };

  const summaryItems = [
    { label: "Days with activity", value: `${weekLogs.length} / 7`, icon: <Calendar size={14} /> },
    { label: "Total crew-days", value: `${totalCrew}`, icon: <Users size={14} /> },
    { label: "Photos uploaded", value: `${weekPhotos.length}`, icon: <Camera size={14} /> },
    { label: "Total spent to date", value: formatCurrency(weekSpent), icon: <DollarSign size={14} /> },
    { label: "Current progress", value: `${project.progress}%`, icon: <TrendingUp size={14} /> },
    { label: "Open items", value: `${project.openItems}`, icon: <AlertTriangle size={14} /> },
  ];

  return (
    <Card padding="md" className="bg-warm/30 border-sand/30">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Weekly summary</SectionLabel>
        <span className="text-[9px] text-muted">
          {weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
        {summaryItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-surface rounded-[var(--radius)] px-2 py-1.5 border border-border">
            <div className="text-clay/50 shrink-0">{item.icon}</div>
            <div className="min-w-0">
              <p className="text-[12px] font-data font-semibold text-earth truncate">{item.value}</p>
              <p className="text-[8px] text-muted truncate">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Activity Log ---

interface ActivityLogProps {
  logs: DailyLogData[];
  photos: PhotoData[];
}

function ActivityLog({ logs, photos }: ActivityLogProps) {
  // Merge logs and photos into a single timeline
  type ActivityEntry = {
    timestamp: string;
    type: "log" | "photo" | "budget";
    description: string;
  };

  const entries: ActivityEntry[] = [];

  logs.forEach((log) => {
    entries.push({
      timestamp: log.createdAt ?? log.date,
      type: "log",
      description: `Day ${log.day}: ${log.content.slice(0, 120)}${log.content.length > 120 ? "..." : ""}`,
    });
  });

  photos.forEach((photo) => {
    entries.push({
      timestamp: photo.date,
      type: "photo",
      description: `Photo uploaded${photo.caption ? `: ${photo.caption}` : ""} (${photo.phase || "General"})`,
    });
  });

  // Sort by timestamp descending, take 20
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recent = entries.slice(0, 20);

  const typeIcon = (type: string) => {
    switch (type) {
      case "log": return <ClipboardList size={12} className="text-clay" />;
      case "photo": return <Camera size={12} className="text-emerald-600" />;
      case "budget": return <DollarSign size={12} className="text-warning" />;
      default: return <Circle size={12} className="text-muted" />;
    }
  };

  return (
    <Card padding="md">
      <SectionLabel>Activity log</SectionLabel>
      {/* TODO: Replace inline empty state below with shared <EmptyState> component for consistency */}
      {recent.length === 0 ? (
        <p className="text-[11px] text-muted text-center py-4">No activity recorded yet</p>
      ) : (
        <div className="max-h-[280px] overflow-y-auto">
          {recent.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 py-1 px-1 ${
                i < recent.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="shrink-0">{typeIcon(entry.type)}</div>
              <p className="flex-1 min-w-0 text-[10px] text-foreground truncate">{entry.description}</p>
              <span className="text-[8px] text-muted font-data shrink-0">{entry.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// --- Material Tracker ---

interface MaterialTrackerProps {
  materials: MaterialData[];
  projectId: string;
  userId: string;
}

function MaterialTracker({ materials, projectId, userId }: MaterialTrackerProps) {
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formQtyOrdered, setFormQtyOrdered] = useState("");
  const [formQtyDelivered, setFormQtyDelivered] = useState("");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formStatus, setFormStatus] = useState<MaterialData["status"]>("ordered");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormQtyOrdered("");
    setFormQtyDelivered("");
    setFormUnitPrice("");
    setFormSupplier("");
    setFormStatus("ordered");
  };

  const handleSubmit = async () => {
    if (!formName || !formQtyOrdered || !formUnitPrice) return;
    setSubmitting(true);
    try {
      await addMaterial(userId, {
        projectId,
        name: formName,
        quantityOrdered: Number(formQtyOrdered),
        quantityDelivered: Number(formQtyDelivered) || 0,
        unitPrice: Number(formUnitPrice),
        supplier: formSupplier || undefined,
        status: formStatus,
      });
      resetForm();
      setShowForm(false);
    } catch {
      showToast("Failed to add material", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (material: MaterialData, newStatus: MaterialData["status"]) => {
    if (!material.id) return;
    try {
      await updateMaterial(userId, projectId, material.id, { status: newStatus });
    } catch {
      showToast("Failed to update material status", "error");
    }
  };

  const statusColor = (status: MaterialData["status"]) => {
    switch (status) {
      case "ordered": return "bg-info-bg text-info";
      case "partial": return "bg-warning-bg text-warning";
      case "delivered": return "bg-emerald-50 text-emerald-700";
      case "verified": return "bg-success-bg text-success";
    }
  };

  const hasDiscrepancy = (m: MaterialData) =>
    m.status === "delivered" && m.quantityDelivered < m.quantityOrdered;

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Material tracker</SectionLabel>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-[10px] text-clay hover:text-earth transition-colors"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />}
          {showForm ? "Cancel" : "Add material"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-3 p-3 rounded-[var(--radius)] bg-warm/30 border border-sand/30 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Material name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="col-span-2 text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-clay"
            />
            <input
              type="number"
              placeholder="Qty ordered"
              value={formQtyOrdered}
              onChange={(e) => setFormQtyOrdered(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-clay"
            />
            <input
              type="number"
              placeholder="Qty delivered"
              value={formQtyDelivered}
              onChange={(e) => setFormQtyDelivered(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-clay"
            />
            <input
              type="number"
              placeholder="Unit price"
              value={formUnitPrice}
              onChange={(e) => setFormUnitPrice(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-clay"
            />
            <input
              type="text"
              placeholder="Supplier (optional)"
              value={formSupplier}
              onChange={(e) => setFormSupplier(e.target.value)}
              className="text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-clay"
            />
          </div>
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as MaterialData["status"])}
            className="w-full text-[11px] px-2.5 py-1.5 rounded border border-border bg-surface text-foreground focus:outline-none focus:border-clay"
          >
            <option value="ordered">Ordered</option>
            <option value="partial">Partially delivered</option>
            <option value="delivered">Delivered</option>
            <option value="verified">Verified</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={submitting || !formName || !formQtyOrdered || !formUnitPrice}
            className="w-full text-[11px] py-1.5 rounded bg-earth text-warm hover:bg-earth/90 transition-colors disabled:opacity-40"
          >
            {submitting ? "Saving..." : "Add material"}
          </button>
        </div>
      )}

      {/* Table */}
      {/* TODO: Replace inline empty state below with shared <EmptyState> component for consistency */}
      {materials.length === 0 ? (
        <div className="py-3 px-2">
          <p className="text-[10px] text-muted mb-2">No materials tracked yet. Add materials to track:</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-muted/70">
            <span>Name and supplier</span>
            <span>Quantity ordered</span>
            <span>Quantity delivered</span>
            <span>Unit price</span>
            <span>Delivery status</span>
            <span>Discrepancy alerts</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-[9px] text-muted uppercase tracking-wider border-b border-border">
                <th className="py-1.5 pr-2">Material</th>
                <th className="py-1.5 px-2 text-right">Ordered</th>
                <th className="py-1.5 px-2 text-right">Delivered</th>
                <th className="py-1.5 pl-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-border last:border-0 hover:bg-warm/30 transition-colors ${
                    hasDiscrepancy(m) ? "bg-danger/5" : ""
                  }`}
                >
                  <td className="py-2 pr-2">
                    <span className="text-foreground">{m.name}</span>
                    {m.supplier && (
                      <span className="block text-[9px] text-muted">{m.supplier}</span>
                    )}
                    {hasDiscrepancy(m) && (
                      <span className="flex items-center gap-0.5 text-[9px] text-danger mt-0.5">
                        <AlertTriangle size={9} />
                        Quantity mismatch
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right font-data text-muted">
                    {m.quantityOrdered}
                  </td>
                  <td className="py-2 px-2 text-right font-data text-muted">
                    {m.quantityDelivered}
                  </td>
                  <td className="py-2 pl-2">
                    <select
                      value={m.status}
                      onChange={(e) => handleStatusChange(m, e.target.value as MaterialData["status"])}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border-0 cursor-pointer ${statusColor(m.status)}`}
                    >
                      <option value="ordered">Ordered</option>
                      <option value="partial">Partial</option>
                      <option value="delivered">Delivered</option>
                      <option value="verified">Verified</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// === Main Monitor Client ===

export function MonitorClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { isOnline } = usePWA();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [logs, setLogs] = useState<DailyLogData[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [punchListItems, setPunchListItems] = useState<PunchListItemData[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToProject(user.uid, projectId, setProject),
      subscribeToPhotos(user.uid, projectId, setPhotos),
      subscribeToDailyLogs(user.uid, projectId, setLogs),
      subscribeToBudgetItems(user.uid, projectId, setBudgetItems),
      subscribeToMaterials(user.uid, projectId, setMaterials),
      subscribeToContacts(user.uid, projectId, setContacts),
      subscribeToTasks(user.uid, projectId, setTasks),
      subscribeToPunchListItems(user.uid, projectId, setPunchListItems),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, `${t("project.monitor")} — ${project.phaseName}`, "info");
    }
  }, [project, setTopbar]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-sand border-t-clay animate-spin mb-3" />
      <p className="text-[12px] text-muted">Loading monitor...</p>
    </div>
  );

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const currentPhaseKey = PHASE_ORDER[project.currentPhase] ?? "BUILD";
  const phaseDef = getPhaseDefinition(market, currentPhaseKey);
  const milestones = phaseDef?.milestones ?? [];
  const lastActivity = logs.length > 0 ? logs[0].date : "No activity";

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("project.monitor")}
        projectName={project.name}
        projectId={projectId}
        subtitle="Diaspora oversight panel"
      />

      {/* Status bar */}
      <Card padding="sm" className="glass">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Eye size={16} className="text-clay" />
            <div>
              <h2 className="text-[14px] font-semibold text-earth">{project.name}</h2>
              <p className="text-[10px] text-muted">
                {PHASE_NAMES[currentPhaseKey]} phase
                <span className="mx-1.5 text-border">|</span>
                Last activity: {lastActivity}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${
              isOnline ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? "Online" : "Offline"}
            </div>
            <button
              onClick={() => {
                if (!project) return;
                const marketData = getMarketData(market);
                const presData: PresentationData = {
                  project,
                  budgetItems,
                  contacts,
                  dailyLogs: logs,
                  tasks,
                  photos,
                  punchListItems,
                  currency: marketData.currency,
                  marketName: project.market,
                  constructionMethod: marketData.phases[0]?.constructionMethod ?? "Standard construction",
                };
                openPresentation("progress", presData);
              }}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-[var(--radius)] bg-earth text-warm hover:bg-earth/90 transition-colors"
            >
              <FileText size={12} />
              Generate weekly report
            </button>
          </div>
        </div>
      </Card>

      {/* Live Camera Feed */}
      <LiveCameraFeed projectId={projectId} userId={user?.uid ?? ""} />

      {/* Main content: Photo feed + Milestone tracker */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3">
          <PhotoFeed photos={photos} projectId={projectId} project={project} contacts={contacts} />
        </div>
        <div className="md:col-span-2">
          <MilestonePaymentTracker
            milestones={milestones}
            photos={photos}
            totalBudget={project.totalBudget}
            currency={project.currency}
          />
        </div>
      </div>

      {/* Weekly summary */}
      <WeeklySummary
        logs={logs}
        photos={photos}
        budgetItems={budgetItems}
        project={project}
      />

      {/* Activity log + Material tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivityLog logs={logs} photos={photos} />
        <MaterialTracker materials={materials} projectId={projectId} userId={user?.uid ?? ""} />
      </div>

    </div>
  );
}
