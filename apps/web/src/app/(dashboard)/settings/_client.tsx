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
  User,
  Shield,
  CreditCard,
  Database,
  ChevronDown,
  AlertTriangle,
  Check,
  Gift,
  Copy,
  Trash2,
  Crown,
} from "lucide-react";
import { PLAN_CONFIG, formatPrice, getAnnualSavings, type PlanTier, type BillingInterval } from "@/lib/stripe-config";
import { useToast } from "@/components/ui/Toast";
import {
  generateTrialCode,
  redeemTrialCode,
  subscribeToTrialCodes,
  revokeTrialCode,
  type TrialCode,
} from "@/lib/services/trial-service";

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

const FOUNDATION_FEATURES = [
  "1 active project",
  "10 AI queries per day",
  "Basic budget tracking",
  "Daily log",
  "Photo uploads (50 max)",
];

const TIER_ORDER: PlanTier[] = ["FOUNDATION", "BUILDER", "DEVELOPER", "ENTERPRISE"];

const DURATION_OPTIONS = [
  { value: 48, label: "48 hours" },
  { value: 72, label: "3 days" },
  { value: 168, label: "7 days" },
];

const MAX_USES_OPTIONS = [
  { value: 1, label: "1" },
  { value: 5, label: "5" },
  { value: 0, label: "Unlimited" },
];

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

  // Plan/billing state
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [upgradingTier, setUpgradingTier] = useState<PlanTier | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);

  // Trial code generation state (admin)
  const [trialTier, setTrialTier] = useState<"BUILDER" | "DEVELOPER">("BUILDER");
  const [trialDuration, setTrialDuration] = useState(48);
  const [trialMaxUses, setTrialMaxUses] = useState(1);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [trialCodes, setTrialCodes] = useState<TrialCode[]>([]);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);

  // Trial code redemption state (non-admin)
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const { showToast } = useToast();

  // Data management state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    setTopbar("Parameters");
  }, [setTopbar]);

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

  // Subscribe to trial codes if admin
  useEffect(() => {
    if (profile?.role !== "admin") return;
    const unsub = subscribeToTrialCodes(setTrialCodes);
    return unsub;
  }, [profile?.role]);

  async function handleUpgrade(tier: PlanTier) {
    if (tier === "FOUNDATION" || !user) return;
    setUpgradingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          planTier: tier,
          billingInterval,
          isAdmin: profile?.role === "admin",
          stripeCustomerId: profile?.stripeCustomerId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || "Failed to start checkout. Please try again.", "error");
      }
    } catch {
      showToast("Failed to start checkout. Please try again.", "error");
    } finally {
      setUpgradingTier(null);
    }
  }

  async function handleManageSubscription() {
    setManagingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId: profile?.stripeCustomerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Failed to open billing portal.", "error");
      }
    } catch {
      showToast("Failed to open billing portal.", "error");
    } finally {
      setManagingPortal(false);
    }
  }

  async function handleGenerateTrialCode() {
    if (!user) return;
    setGeneratingCode(true);
    try {
      const code = await generateTrialCode(user.uid, trialTier, trialDuration, trialMaxUses);
      setGeneratedCode(code);
      showToast("Trial code generated successfully.", "success");
    } catch {
      showToast("Failed to generate trial code.", "error");
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleRevokeTrialCode(code: string) {
    setRevokingCode(code);
    try {
      await revokeTrialCode(code);
      showToast("Trial code revoked.", "success");
    } catch {
      showToast("Failed to revoke code.", "error");
    } finally {
      setRevokingCode(null);
    }
  }

  async function handleRedeemTrialCode() {
    if (!user || !redeemCode.trim()) return;
    setRedeeming(true);
    try {
      const result = await redeemTrialCode(user.uid, redeemCode.trim().toUpperCase());
      if (result.success) {
        const expiry = result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : "";
        showToast(`Trial activated: ${result.tier} tier until ${expiry}`, "success");
        setRedeemCode("");
      } else {
        showToast(result.error ?? "Failed to redeem code.", "error");
      }
    } catch {
      showToast("Failed to redeem code. Please try again.", "error");
    } finally {
      setRedeeming(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard.", "success");
    });
  }

  function getTrialCodeStatus(code: TrialCode): "active" | "expired" | "revoked" {
    if (code.revokedAt) return "revoked";
    if (new Date(code.expiresAt) < new Date()) return "expired";
    return "active";
  }

  const currentPlan = profile?.plan ?? "FOUNDATION";
  const isAdmin = profile?.role === "admin";
  const hasActiveSubscription = profile?.subscriptionStatus === "active";
  const isTrialing = profile?.subscriptionStatus === "trialing";

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
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[13px] font-medium text-earth">
                Current plan: {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              </p>
              <p className="text-[11px] text-muted">Compare plans and features</p>
            </div>
            {isAdmin && (
              <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-clay/10 text-clay rounded-full">
                Enterprise (Admin)
              </span>
            )}
            {isTrialing && (
              <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-warning/10 text-warning rounded-full">
                Trial: {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()} — expires {profile?.trialExpiresAt ? new Date(profile.trialExpiresAt).toLocaleDateString() : ""}
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted leading-relaxed mb-4">
          Your current plan determines how many projects you can manage and how many AI queries you can make per day. Most individual builders start with Foundation and upgrade to Builder when they start their second project.
        </p>

        {/* Billing interval toggle */}
        {!isAdmin && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
                billingInterval === "monthly"
                  ? "bg-earth text-warm"
                  : "bg-surface-alt text-muted hover:text-earth"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                billingInterval === "annual"
                  ? "bg-earth text-warm"
                  : "bg-surface-alt text-muted hover:text-earth"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-success text-white rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        )}

        {/* Free plan upgrade prompt */}
        {currentPlan === "FOUNDATION" && !hasActiveSubscription && !isAdmin && (
          <div className="mb-4 p-3 rounded-xl bg-warm/50 border border-sand/30">
            <p className="text-[12px] text-earth">
              <span className="font-medium">You are on the free plan.</span> Upgrade to unlock more projects, AI queries, document generation, and exports.
            </p>
          </div>
        )}

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIER_ORDER.map((tier) => {
            const isCurrent = tier === currentPlan;
            const isFoundation = tier === "FOUNDATION";
            const tierName = tier.charAt(0) + tier.slice(1).toLowerCase();
            const features = isFoundation ? FOUNDATION_FEATURES : PLAN_CONFIG[tier as Exclude<PlanTier, "FOUNDATION">].features;
            const config = isFoundation ? null : PLAN_CONFIG[tier as Exclude<PlanTier, "FOUNDATION">];
            const price = config
              ? billingInterval === "monthly"
                ? formatPrice(config.monthlyPrice)
                : formatPrice(config.annualPrice)
              : "Free";
            const priceLabel = config
              ? billingInterval === "monthly" ? "/mo" : "/yr"
              : "";
            const isDeveloper = tier === "DEVELOPER";
            const tierIndex = ["FOUNDATION", "BUILDER", "DEVELOPER", "ENTERPRISE"].indexOf(tier);
            const currentIndex = ["FOUNDATION", "BUILDER", "DEVELOPER", "ENTERPRISE"].indexOf(currentPlan);
            const isHigherTier = tierIndex > currentIndex;
            const isLowerTier = tierIndex < currentIndex;

            return (
              <div
                key={tier}
                className={`relative p-4 rounded-2xl border transition-shadow ${
                  isCurrent
                    ? "border-success/40 bg-success/5 shadow-sm"
                    : isDeveloper
                    ? "border-clay/30 bg-surface shadow-sm"
                    : "border-border bg-surface"
                }`}
              >
                {isDeveloper && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-clay text-warm rounded-full flex items-center gap-1">
                      <Crown size={10} /> Most popular
                    </span>
                  </div>
                )}

                <p className="text-[13px] font-semibold text-earth mb-1">{tierName}</p>
                <p className="text-[18px] font-bold text-earth mb-3">
                  {price}
                  {priceLabel && <span className="text-[11px] font-normal text-muted">{priceLabel}</span>}
                </p>

                {config && billingInterval === "annual" && (
                  <p className="text-[10px] text-success font-medium mb-2">
                    Save {formatPrice(getAnnualSavings(tier as Exclude<PlanTier, "FOUNDATION">))} per year
                  </p>
                )}

                <ul className="space-y-1.5 mb-4">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted">
                      <Check size={10} className="text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="text-center">
                    <span className="inline-block w-full px-3 py-1.5 text-[10px] font-medium text-success bg-success/10 rounded-full">
                      Current plan
                    </span>
                    {profile?.billingInterval && !isFoundation && (
                      <p className="text-[9px] text-muted mt-1">
                        Billed {profile.billingInterval === "annual" ? "annually" : "monthly"}
                      </p>
                    )}
                  </div>
                ) : isAdmin ? (
                  <span className="inline-block w-full text-center px-3 py-1.5 text-[10px] text-muted">
                    Admin access
                  </span>
                ) : isFoundation && isLowerTier && hasActiveSubscription ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={managingPortal}
                    className="w-full px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors disabled:opacity-40 border border-border text-muted hover:text-earth hover:bg-surface-alt"
                  >
                    {managingPortal ? "Opening..." : "Downgrade"}
                  </button>
                ) : isFoundation ? (
                  <span className="inline-block w-full text-center px-3 py-1.5 text-[10px] text-muted">
                    Free tier
                  </span>
                ) : isLowerTier && hasActiveSubscription ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={managingPortal}
                    className="w-full px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors disabled:opacity-40 border border-border text-muted hover:text-earth hover:bg-surface-alt"
                  >
                    {managingPortal ? "Opening..." : "Downgrade"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={upgradingTier === tier}
                    className={`w-full px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors disabled:opacity-40 ${
                      isDeveloper
                        ? "bg-clay text-warm hover:bg-clay/90"
                        : "bg-earth text-warm hover:bg-earth-light"
                    }`}
                  >
                    {upgradingTier === tier ? "Redirecting..." : "Upgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Manage subscription for active subscribers */}
        {hasActiveSubscription && !isAdmin && (
          <div className="mt-4 p-4 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-earth">Subscription Management</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Change your plan, update payment method, view invoices, or cancel your subscription.
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={managingPortal}
                className="shrink-0 px-4 py-2 text-[12px] font-medium border border-border text-earth rounded-xl hover:bg-surface-alt transition-colors disabled:opacity-40"
              >
                {managingPortal ? "Opening..." : "Manage Subscription"}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ================================================================= */}
      {/* Trial Code Redemption (non-admin users)                            */}
      {/* ================================================================= */}
      {!isAdmin && (
        <>
          <SectionLabel>Trial Code</SectionLabel>
          <Card padding="md" className="mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
                <Gift size={20} className="text-clay" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-earth">Have a trial code?</p>
                <p className="text-[11px] text-muted">Enter a code to unlock a temporary plan upgrade</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="e.g. KEY-48H-BUI-XXXX"
                className="flex-1 px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay font-mono tracking-wider input-focus"
              />
              <button
                onClick={handleRedeemTrialCode}
                disabled={redeeming || !redeemCode.trim()}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 shrink-0"
              >
                {redeeming ? "Redeeming..." : "Redeem"}
              </button>
            </div>
          </Card>
        </>
      )}

      {/* ================================================================= */}
      {/* Admin Trial Code Management                                        */}
      {/* ================================================================= */}
      {isAdmin && (
        <>
          <SectionLabel>
            <span className="flex items-center gap-2">
              Trial Codes
              <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-clay/10 text-clay rounded-full">
                Admin
              </span>
            </span>
          </SectionLabel>
          <Card padding="md" className="mb-5">
            {/* Generate Trial Code */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center">
                <Gift size={20} className="text-clay" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-earth">Generate Trial Code</p>
                <p className="text-[11px] text-muted">Create codes to give users temporary plan access</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">Tier</label>
                <select
                  value={trialTier}
                  onChange={(e) => setTrialTier(e.target.value as "BUILDER" | "DEVELOPER")}
                  className="w-full px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
                >
                  <option value="BUILDER">Builder</option>
                  <option value="DEVELOPER">Developer</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">Duration</label>
                <select
                  value={trialDuration}
                  onChange={(e) => setTrialDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">Max uses</label>
                <select
                  value={trialMaxUses}
                  onChange={(e) => setTrialMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
                >
                  {MAX_USES_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateTrialCode}
              disabled={generatingCode}
              className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 mb-3"
            >
              {generatingCode ? "Generating..." : "Generate Code"}
            </button>

            {generatedCode && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] bg-success/5 border border-success/20 mb-4">
                <span className="text-[13px] font-mono font-semibold text-earth tracking-wider">{generatedCode}</span>
                <button
                  onClick={() => copyToClipboard(generatedCode)}
                  className="p-1.5 rounded-[var(--radius)] hover:bg-surface-alt transition-colors text-muted hover:text-earth"
                  title="Copy code"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}

            {/* Active Codes Table */}
            {trialCodes.length > 0 && (
              <div className="border-t border-border pt-4 mt-2">
                <p className="text-[12px] font-semibold text-earth mb-3">Active Codes</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 text-muted font-medium">Code</th>
                        <th className="text-left py-2 pr-3 text-muted font-medium">Tier</th>
                        <th className="text-left py-2 pr-3 text-muted font-medium">Duration</th>
                        <th className="text-left py-2 pr-3 text-muted font-medium">Uses</th>
                        <th className="text-left py-2 pr-3 text-muted font-medium">Expires</th>
                        <th className="text-left py-2 pr-3 text-muted font-medium">Status</th>
                        <th className="text-right py-2 text-muted font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialCodes.map((tc) => {
                        const status = getTrialCodeStatus(tc);
                        return (
                          <tr key={tc.code} className="border-b border-border/50">
                            <td className="py-2 pr-3 font-mono tracking-wider text-earth">{tc.code}</td>
                            <td className="py-2 pr-3 text-muted">{tc.tier.charAt(0) + tc.tier.slice(1).toLowerCase()}</td>
                            <td className="py-2 pr-3 text-muted">{tc.durationHours}h</td>
                            <td className="py-2 pr-3 text-muted">{tc.usedCount}/{tc.maxUses === 0 ? "Unlimited" : tc.maxUses}</td>
                            <td className="py-2 pr-3 text-muted">{new Date(tc.expiresAt).toLocaleDateString()}</td>
                            <td className="py-2 pr-3">
                              <span className={`inline-block px-2 py-0.5 text-[9px] font-semibold uppercase rounded-full ${
                                status === "active"
                                  ? "bg-success/10 text-success"
                                  : status === "expired"
                                  ? "bg-muted/10 text-muted"
                                  : "bg-danger/10 text-danger"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              {status === "active" && (
                                <button
                                  onClick={() => handleRevokeTrialCode(tc.code)}
                                  disabled={revokingCode === tc.code}
                                  className="p-1 rounded-[var(--radius)] hover:bg-danger/5 text-muted hover:text-danger transition-colors disabled:opacity-40"
                                  title="Revoke code"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

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
        <div className="mb-6">
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
