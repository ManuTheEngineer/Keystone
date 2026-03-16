"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import {
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
} from "firebase/auth";
import { ref, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useTopbar } from "../layout";
import {
  subscribeToUserProjects,
  deleteProject,
  type ProjectData,
} from "@/lib/services/project-service";
import {
  User,
  Shield,
  CreditCard,
  Database,
  ChevronDown,
  AlertTriangle,
  Check,
  Trash2,
} from "lucide-react";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Africa/Lome",
  "Africa/Accra",
  "Africa/Porto-Novo",
  "Europe/London",
  "Europe/Paris",
];

const CURRENCIES = [
  { code: "USD", label: "USD ($)" },
  { code: "XOF", label: "XOF (CFA)" },
  { code: "GHS", label: "GHS (GH\u20B5)" },
];

const PLAN_FEATURES: Record<string, string[]> = {
  FOUNDATION: [
    "1 active project",
    "10 AI queries per day",
    "Basic budget tracking",
    "Daily log",
    "Photo uploads (50 max)",
  ],
  BUILDER: [
    "3 active projects",
    "50 AI queries per day",
    "Full budget with benchmarks",
    "Document generation",
    "Photo uploads (500 max)",
    "Export to PDF/CSV",
  ],
  DEVELOPER: [
    "Unlimited projects",
    "Unlimited AI queries",
    "Advanced financial modeling",
    "All document templates",
    "Unlimited photos",
    "Priority support",
    "Team collaboration",
  ],
  ENTERPRISE: [
    "Everything in Developer",
    "Custom integrations",
    "Dedicated account manager",
    "SLA guarantees",
    "SSO authentication",
    "Audit logging",
  ],
};

export function SettingsClient() {
  const { user, profile } = useAuth();
  const { setTopbar } = useTopbar();
  const router = useRouter();

  // Profile state
  const [displayName, setDisplayName] = useState(profile?.name ?? user?.displayName ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC");
  const [currency, setCurrency] = useState(profile?.currency ?? "USD");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Security state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Data management state
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(false);
  const [deleteProjectNameConfirm, setDeleteProjectNameConfirm] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteProjectError, setDeleteProjectError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    setTopbar("Parameters");
  }, [setTopbar]);

  // Subscribe to user projects for data management
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProjects(user.uid, setProjects);
    return unsub;
  }, [user]);

  // Update form state when profile loads asynchronously
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name ?? "");
      setTimezone(profile.timezone ?? "UTC");
      setCurrency(profile.currency ?? "USD");
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!user) return;
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileMessage("");
    try {
      await updateProfile(user, { displayName });
      await update(ref(db, `users/${user.uid}/profile`), {
        name: displayName,
        timezone,
        currency,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileMessage("Failed to save changes. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleUpdatePassword() {
    if (!user || !user.email) return;
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password update failed.";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setPasswordError("Current password is incorrect.");
      } else {
        setPasswordError(msg);
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const uid = user.uid;
      // Delete data first (can be re-created if auth deletion fails)
      await remove(ref(db, `users/${uid}`));
      // Then delete auth account (point of no return)
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        setDeleteError("For security, please sign out, sign back in, and try again within 5 minutes.");
      } else {
        setDeleteError("Account deletion failed. Please try again.");
      }
      setDeleting(false);
    }
  }

  async function handleDeleteSelectedProject() {
    if (!user || !selectedProjectId) return;
    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProject || deleteProjectNameConfirm !== selectedProject.name) return;
    setDeletingProject(true);
    setDeleteProjectError("");
    try {
      await deleteProject(user.uid, selectedProjectId);
      setSelectedProjectId("");
      setShowDeleteProjectConfirm(false);
      setDeleteProjectNameConfirm("");
    } catch {
      setDeleteProjectError("Failed to delete project. Please try again.");
    } finally {
      setDeletingProject(false);
    }
  }

  async function handleResetAllData() {
    if (!user || resetConfirmText !== "RESET") return;
    setResetting(true);
    setResetError("");
    try {
      await remove(ref(db, `users/${user.uid}/projects`));
      await remove(ref(db, `users/${user.uid}/aiUsage`));
      setShowResetConfirm(false);
      setResetConfirmText("");
      router.push("/dashboard");
    } catch {
      setResetError("Failed to reset data. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  function handleExportAll() {
    // Trigger a JSON download of all user data by navigating to export
    // For now, this creates a placeholder download
    const data = {
      profile: profile,
      exportedAt: new Date().toISOString(),
      note: "Full project data export. Use the Export button on individual project overview pages for complete project data.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keystone-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentPlan = profile?.plan ?? "FOUNDATION";

  return (
    <div className="animate-stagger">
      <PageHeader title="Parameters" />

      {/* ================================================================= */}
      {/* Profile Section                                                    */}
      {/* ================================================================= */}
      <SectionLabel>Profile</SectionLabel>
      <Card padding="md" className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
            <User size={20} className="text-clay" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-earth">{displayName || "User"}</p>
            <p className="text-[11px] text-muted">{user?.email ?? ""}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-muted font-medium mb-1">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full input-focus"
            />
          </div>

          <div>
            <label className="block text-[11px] text-muted font-medium mb-1">Email</label>
            <input
              type="text"
              value={user?.email ?? ""}
              disabled
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface-alt text-muted w-full cursor-not-allowed"
            />
            <p className="text-[10px] text-muted mt-0.5">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="block text-[11px] text-muted font-medium mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-muted font-medium mb-1">Currency preference</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 btn-hover"
            >
              {profileSaving ? "Saving..." : "Save changes"}
            </button>
            {profileSuccess && (
              <span className="flex items-center gap-1 text-[11px] text-success">
                <Check size={14} /> Saved
              </span>
            )}
            {profileMessage && (
              <span className="text-[11px] text-danger">{profileMessage}</span>
            )}
          </div>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* Security Section                                                   */}
      {/* ================================================================= */}
      <SectionLabel>Security</SectionLabel>
      <Card padding="md" className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
            <Shield size={20} className="text-clay" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-earth">Password</p>
            <p className="text-[11px] text-muted">Manage your account password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-2 mb-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
            <Check size={14} /> Password updated successfully.
          </div>
        )}

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="flex items-center gap-1 text-[12px] text-info hover:underline cursor-pointer"
          >
            Change password
            <ChevronDown size={14} />
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>

            {passwordError && (
              <p className="text-[11px] text-danger">{passwordError}</p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleUpdatePassword}
                disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                {passwordSaving ? "Updating..." : "Update password"}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ================================================================= */}
      {/* Plan Section                                                       */}
      {/* ================================================================= */}
      <SectionLabel>Plan</SectionLabel>
      <Card padding="md" className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
            <CreditCard size={20} className="text-clay" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-earth">
              Current plan: {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
            </p>
            <p className="text-[11px] text-muted">Compare plans and features</p>
          </div>
        </div>

        <p className="text-[11px] text-muted leading-relaxed mb-3">
          Your current plan determines how many projects you can manage and how many AI queries you can make per day. Most individual builders start with Foundation and upgrade to Builder when they start their second project.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(PLAN_FEATURES).map(([plan, features]) => {
            const isCurrentPlan = plan === currentPlan;
            const planName = plan.charAt(0) + plan.slice(1).toLowerCase();
            return (
              <div
                key={plan}
                className={`p-3 rounded-[var(--radius)] border ${
                  isCurrentPlan
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-border bg-surface"
                }`}
              >
                <p className="text-[12px] font-semibold text-earth mb-2">{planName}</p>
                <ul className="space-y-1.5 mb-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted">
                      <Check size={10} className="text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <span className="inline-block px-3 py-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded-full">
                    Current plan
                  </span>
                ) : (
                  <span className="text-[11px] text-muted">Upgrades coming soon</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ================================================================= */}
      {/* Data Section                                                       */}
      {/* ================================================================= */}
      <SectionLabel>Data</SectionLabel>
      <Card padding="md" className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
            <Database size={20} className="text-clay" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-earth">Your data</p>
            <p className="text-[11px] text-muted">Export or delete your account data</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
          >
            Export profile data
          </button>
          <p className="text-[10px] text-muted mt-1">
            Exports your profile and preferences. For full project data, use the Export button on each project's overview page.
          </p>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* Data Management Section                                            */}
      {/* ================================================================= */}
      <SectionLabel>Data Management</SectionLabel>
      <Card padding="md" className="mb-5">
        {/* Delete a Project */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
              <Trash2 size={20} className="text-clay" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-earth">Delete a Project</p>
              <p className="text-[11px] text-muted">
                Permanently remove a specific project and all its data (budget, contacts, logs, photos, documents, tasks).
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <p className="text-[11px] text-muted">No projects found.</p>
          ) : (
            <div className="space-y-2">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setShowDeleteProjectConfirm(false);
                  setDeleteProjectNameConfirm("");
                  setDeleteProjectError("");
                }}
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500 w-full"
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {selectedProjectId && !showDeleteProjectConfirm && (
                <button
                  onClick={() => setShowDeleteProjectConfirm(true)}
                  className="px-4 py-2 text-[12px] border border-danger text-danger rounded-[var(--radius)] hover:bg-danger/5 transition-colors"
                >
                  Delete selected project
                </button>
              )}

              {showDeleteProjectConfirm && selectedProjectId && (() => {
                const selectedProject = projects.find((p) => p.id === selectedProjectId);
                return selectedProject ? (
                  <div className="p-3 border border-danger rounded-[var(--radius)] bg-danger/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-danger" />
                      <p className="text-[12px] font-medium text-danger">Confirm project deletion</p>
                    </div>
                    <p className="text-[11px] text-muted mb-2">
                      Are you sure you want to delete <strong className="text-earth">{selectedProject.name}</strong>? This cannot be undone. Type the project name to confirm.
                    </p>
                    {deleteProjectError && (
                      <p className="text-[11px] text-danger mb-2">{deleteProjectError}</p>
                    )}
                    <input
                      type="text"
                      value={deleteProjectNameConfirm}
                      onChange={(e) => setDeleteProjectNameConfirm(e.target.value)}
                      placeholder={`Type "${selectedProject.name}" to confirm`}
                      className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-danger w-full mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteSelectedProject}
                        disabled={deleteProjectNameConfirm !== selectedProject.name || deletingProject}
                        className="px-4 py-2 text-[12px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40"
                      >
                        {deletingProject ? "Deleting..." : "Delete project"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteProjectConfirm(false);
                          setDeleteProjectNameConfirm("");
                          setDeleteProjectError("");
                        }}
                        className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5 mb-6">
          {/* Reset All Data */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Database size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-earth">Reset All Data</p>
              <p className="text-[11px] text-muted">
                Delete all your projects and data but keep your account, preferences, and login. This is useful if you want to start fresh.
              </p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 text-[12px] border border-warning text-warning rounded-[var(--radius)] hover:bg-warning/5 transition-colors"
            >
              Reset all data
            </button>
          ) : (
            <div className="p-3 border border-warning rounded-[var(--radius)] bg-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-warning" />
                <p className="text-[12px] font-medium text-warning">Confirm data reset</p>
              </div>
              <p className="text-[11px] text-muted mb-2">
                This will permanently delete ALL your projects and data. Your account and preferences will be preserved. Type RESET to confirm.
              </p>
              {resetError && (
                <p className="text-[11px] text-danger mb-2">{resetError}</p>
              )}
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Type RESET to confirm"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-warning w-full mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAllData}
                  disabled={resetConfirmText !== "RESET" || resetting}
                  className="px-4 py-2 text-[12px] bg-warning text-white rounded-[var(--radius)] hover:bg-warning/90 transition-colors disabled:opacity-40"
                >
                  {resetting ? "Resetting..." : "Reset all data"}
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText("");
                    setResetError("");
                  }}
                  className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5">
          {/* Delete Account Permanently */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-danger">Delete Account Permanently</p>
              <p className="text-[11px] text-muted">
                Permanently delete your entire account, all projects, all data, and your login credentials. You will not be able to recover any information after this action.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-[12px] border border-danger text-danger rounded-[var(--radius)] hover:bg-danger/5 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="p-3 border border-danger rounded-[var(--radius)] bg-danger/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-danger" />
                <p className="text-[12px] font-medium text-danger">Confirm account deletion</p>
              </div>
              <p className="text-[11px] text-muted mb-2">
                Type DELETE to confirm. This will permanently remove your account and all associated data.
              </p>
              {deleteError && (
                <p className="text-[11px] text-danger mb-2">{deleteError}</p>
              )}
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-danger w-full mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="px-4 py-2 text-[12px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40"
                >
                  {deleting ? "Deleting..." : "Delete my account"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-4 py-2 text-[12px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
