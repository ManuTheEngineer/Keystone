"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Upload,
  Image,
  Bell,
} from "lucide-react";
import { PLAN_CONFIG, formatPrice, getAnnualSavings, type PlanTier, type BillingInterval } from "@/lib/stripe-config";
import { getAuthHeaders } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/hooks/use-translation";
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

const TIER_DISPLAY_NAME: Record<PlanTier, string> = {
  FOUNDATION: "Starter",
  BUILDER: "Builder",
  DEVELOPER: "Developer",
  ENTERPRISE: "Enterprise",
};

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
  const [deletePassword, setDeletePassword] = useState("");
  const [showPasswordForDelete, setShowPasswordForDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Plan/billing state
  const [settingsTab, setSettingsTab] = useState<"profile" | "plan" | "notifications" | "data">("profile");
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [upgradingTier, setUpgradingTier] = useState<PlanTier | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);

  // Downgrade confirmation state
  const [downgradeTarget, setDowngradeTarget] = useState<PlanTier | null>(null);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

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
  const { t } = useTranslation();

  // Data management state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    setTopbar(t("settings.title"));
  }, [setTopbar]);

  // Verify Stripe checkout on redirect back from payment
  useEffect(() => {
    const upgradeStatus = searchParams.get("upgrade");
    const sessionId = searchParams.get("session_id");
    if (upgradeStatus === "success" && sessionId) {
      getAuthHeaders().then((headers) =>
      fetch("/api/stripe/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId }),
      }))
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showToast(`Upgraded to ${data.plan} plan successfully!`, "success");
          } else {
            showToast("Payment received. Your plan will update shortly.", "info");
          }
          // Wait for Firebase onValue subscription to pick up the change
          setTimeout(() => router.replace("/settings"), 1500);
        })
        .catch(() => {
          showToast("Payment received. Your plan will update shortly.", "info");
          setTimeout(() => router.replace("/settings"), 1500);
        });
    } else if (upgradeStatus === "canceled") {
      showToast("Upgrade canceled.", "info");
      router.replace("/settings");
    }
  }, [searchParams, router, showToast]);

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
      showToast("Settings saved.", "success");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileMessage("Failed to save changes. Please try again.");
      showToast("Failed to save changes.", "error");
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
    if (!user || !user.email || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const uid = user.uid;
      // Delete all user data first
      await remove(ref(db, `users/${uid}`));
      // Try to delete auth account — may fail if session is old
      try {
        await deleteUser(user);
      } catch {
        // Auth deletion failed (requires recent login) — data is already gone
        // Sign out so user can't access empty account
      }
      router.push("/");
    } catch {
      setDeleteError("Account deletion failed. Please try again.");
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
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
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
      const headers = await getAuthHeaders();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers,
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

  async function handleDowngradeClick(targetTier: PlanTier) {
    setDowngradeTarget(targetTier);
    setDowngradeLoading(true);
    setSubscriptionEndDate(null);

    // Fetch current subscription period end from Stripe
    if (profile?.stripeSubscriptionId) {
      try {
        const subHeaders = await getAuthHeaders();
        const res = await fetch("/api/stripe/subscription", {
          method: "POST",
          headers: subHeaders,
          body: JSON.stringify({ stripeSubscriptionId: profile.stripeSubscriptionId }),
        });
        const data = await res.json();
        if (data.currentPeriodEnd) {
          setSubscriptionEndDate(
            new Date(data.currentPeriodEnd * 1000).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
        }
      } catch {
        // If we can't fetch, still show the dialog without the date
      }
    }
    setDowngradeLoading(false);
  }

  function handleDowngradeConfirm() {
    setDowngradeTarget(null);
    handleManageSubscription();
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
      const result = await revokeTrialCode(code);
      if (result.warning) {
        showToast(`Code revoked. ${result.warning}`, "info");
      } else {
        showToast(
          result.revokedUsers > 0
            ? `Trial code revoked. ${result.revokedUsers} user(s) downgraded to Starter.`
            : "Trial code revoked.",
          "success"
        );
      }
    } catch {
      showToast("Failed to revoke code.", "error");
    } finally {
      setRevokingCode(null);
    }
  }

  async function handleRedeemTrialCode() {
    if (!user || !redeemCode.trim()) {
      showToast("Please enter a trial code.", "error");
      return;
    }
    setRedeeming(true);
    try {
      const result = await redeemTrialCode(user.uid, redeemCode.trim().toUpperCase());
      if (result.success) {
        const expiry = result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : "";
        showToast(`Trial activated! ${result.tier} tier until ${expiry}`, "success");
        setRedeemCode("");
      } else {
        showToast(result.error ?? "Invalid code. Please check and try again.", "error");
      }
    } catch (err) {
      console.error("Trial code redemption error:", err);
      showToast("Failed to redeem code. Check your connection and try again.", "error");
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
      <PageHeader title={t("settings.title")} />

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {([
          { id: "profile" as const, label: t("settings.profile") },
          { id: "plan" as const, label: t("settings.plan") },
          { id: "notifications" as const, label: t("settings.notifications") },
          { id: "data" as const, label: t("settings.data") },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              settingsTab === tab.id
                ? "border-clay text-earth"
                : "border-transparent text-muted hover:text-earth"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* PROFILE TAB                                                        */}
      {/* ================================================================= */}
      {settingsTab === "profile" && (
      <>
      <SectionLabel>{t("settings.profile")}</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
            <User size={16} className="text-clay" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-earth">{displayName || "User"}</p>
            <p className="text-[10px] text-muted">{user?.email ?? ""}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">{t("settings.displayName")}</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay w-full input-focus"
            />
          </div>

          <div>
            <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">{t("auth.email")}</label>
            <input
              type="text"
              value={user?.email ?? ""}
              disabled
              className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface-alt text-muted w-full cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">{t("settings.timezone")}</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay w-full"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">{t("settings.currency")}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay w-full"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">{t("settings.language")}</label>
            <select
              value={profile?.locale ?? "en"}
              onChange={async (e) => {
                if (!user) return;
                await update(ref(db, `users/${user.uid}/profile`), { locale: e.target.value });
                showToast(
                  e.target.value === "fr" ? "Langue mise à jour." :
                  e.target.value === "es" ? "Idioma actualizado." :
                  "Language updated.", "success"
                );
              }}
              className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay w-full"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 btn-hover"
            >
              {profileSaving ? t("label.loading") : t("settings.saveChanges")}
            </button>
            {profileSuccess && (
              <span className="flex items-center gap-1 text-[10px] text-success">
                <Check size={12} /> Saved
              </span>
            )}
            {profileMessage && (
              <span className="text-[10px] text-danger">{profileMessage}</span>
            )}
          </div>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* Security Section                                                   */}
      {/* ================================================================= */}
      <SectionLabel>{t("settings.security")}</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
            <Shield size={16} className="text-clay" />
          </div>
          <p className="text-[13px] font-medium text-earth">Password</p>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-2 mb-2 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800">
            <Check size={12} /> Password updated successfully.
          </div>
        )}

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="flex items-center gap-1 text-[11px] text-info hover:underline cursor-pointer"
          >
            {t("settings.changePassword")}
            <ChevronDown size={12} />
          </button>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay w-full"
              />
            </div>
            <div>
              <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay w-full"
              />
            </div>
            <div>
              <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay w-full"
              />
            </div>

            {passwordError && (
              <p className="text-[10px] text-danger">{passwordError}</p>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={handleUpdatePassword}
                disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
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
                className="px-3 py-1.5 text-[11px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      </>
      )}

      {/* ================================================================= */}
      {/* PLAN & BILLING TAB                                                 */}
      {/* ================================================================= */}
      {settingsTab === "plan" && (
      <>
      <SectionLabel>Plan</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
            <CreditCard size={16} className="text-clay" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium text-earth">
              {TIER_DISPLAY_NAME[currentPlan] ?? currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
            </p>
            {isAdmin && (
              <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-clay/10 text-clay rounded-full">
                Admin
              </span>
            )}
            {isTrialing && (
              <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-warning/10 text-warning rounded-full">
                Trial -- expires {profile?.trialExpiresAt ? new Date(profile.trialExpiresAt).toLocaleDateString() : ""}
              </span>
            )}
          </div>
        </div>

        {/* Billing interval toggle */}
        {!isAdmin && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors ${
                billingInterval === "monthly"
                  ? "bg-earth text-warm"
                  : "bg-surface-alt text-muted hover:text-earth"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors flex items-center gap-1 ${
                billingInterval === "annual"
                  ? "bg-earth text-warm"
                  : "bg-surface-alt text-muted hover:text-earth"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-success text-white rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        )}

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {TIER_ORDER.map((tier) => {
            const isCurrent = tier === currentPlan;
            const isFoundation = tier === "FOUNDATION";
            const tierName = TIER_DISPLAY_NAME[tier] ?? tier.charAt(0) + tier.slice(1).toLowerCase();
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
                className={`relative p-3 rounded-xl border transition-shadow flex flex-col ${
                  isCurrent
                    ? "border-success/40 bg-success/5 shadow-sm"
                    : isDeveloper
                    ? "border-clay/30 bg-surface shadow-sm"
                    : "border-border bg-surface"
                }`}
              >
                {isDeveloper && !isCurrent && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-clay text-warm rounded-full flex items-center gap-1">
                      <Crown size={9} /> Popular
                    </span>
                  </div>
                )}

                <p className="text-[11px] font-semibold text-earth mb-0.5">{tierName}</p>
                <p className="text-[16px] font-bold text-earth mb-2">
                  {price}
                  {priceLabel && <span className="text-[10px] font-normal text-muted">{priceLabel}</span>}
                </p>

                {config && billingInterval === "annual" && (
                  <p className="text-[9px] text-success font-medium mb-1.5">
                    Save {formatPrice(getAnnualSavings(tier as Exclude<PlanTier, "FOUNDATION">))}/yr
                  </p>
                )}

                <ul className="space-y-1 mb-3 flex-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1 text-[9px] text-muted">
                      <Check size={9} className="text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isAdmin ? (
                  <span className="inline-block w-full text-center px-2 py-1 text-[9px] font-medium text-success bg-success/10 rounded-full">
                    Admin access
                  </span>
                ) : isCurrent ? (
                  <div className="text-center">
                    <span className="inline-block w-full px-2 py-1 text-[9px] font-medium text-success bg-success/10 rounded-full">
                      Current plan
                    </span>
                    {profile?.billingInterval && !isFoundation && (
                      <p className="text-[8px] text-muted mt-0.5">
                        Billed {profile.billingInterval === "annual" ? "annually" : "monthly"}
                      </p>
                    )}
                  </div>
                ) : isFoundation && isLowerTier && hasActiveSubscription ? (
                  <button
                    onClick={() => handleDowngradeClick(tier)}
                    disabled={managingPortal}
                    className="w-full px-2 py-1 text-[10px] font-medium rounded-full transition-colors disabled:opacity-40 border border-border text-muted hover:text-earth hover:bg-surface-alt"
                  >
                    {managingPortal ? "Opening..." : "Downgrade"}
                  </button>
                ) : isFoundation ? (
                  <span className="inline-block w-full text-center px-2 py-1 text-[9px] text-muted">
                    Free tier
                  </span>
                ) : isLowerTier && hasActiveSubscription ? (
                  <button
                    onClick={() => handleDowngradeClick(tier)}
                    disabled={managingPortal}
                    className="w-full px-2 py-1 text-[10px] font-medium rounded-full transition-colors disabled:opacity-40 border border-border text-muted hover:text-earth hover:bg-surface-alt"
                  >
                    {managingPortal ? "Opening..." : "Downgrade"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={upgradingTier === tier}
                    className={`w-full px-2 py-1 text-[10px] font-medium rounded-full transition-colors disabled:opacity-40 ${
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
          <div className="mt-3 p-2.5 rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium text-earth">Manage billing, invoices, or cancel</p>
              <button
                onClick={handleManageSubscription}
                disabled={managingPortal}
                className="shrink-0 px-3 py-1.5 text-[10px] font-medium border border-border text-earth rounded-lg hover:bg-surface-alt transition-colors disabled:opacity-40"
              >
                {managingPortal ? "Opening..." : "Manage Subscription"}
              </button>
            </div>
          </div>
        )}

        {/* Downgrade confirmation dialog */}
        {downgradeTarget && (
          <div className="mt-3 p-3 rounded-xl border border-warning/30 bg-warning/5 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-warning shrink-0" />
              <p className="text-[13px] font-semibold text-earth" style={{ fontFamily: "var(--font-heading)" }}>
                Downgrade to {TIER_DISPLAY_NAME[downgradeTarget] ?? downgradeTarget.charAt(0) + downgradeTarget.slice(1).toLowerCase()}
              </p>
            </div>

            {downgradeLoading ? (
              <p className="text-[10px] text-muted">Loading billing details...</p>
            ) : (
              <div className="space-y-1.5 text-[10px] text-earth mb-2.5">
                <p>
                  Current {TIER_DISPLAY_NAME[currentPlan] ?? currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()} plan stays active
                  {subscriptionEndDate
                    ? <> until <span className="font-data font-semibold">{subscriptionEndDate}</span>.</>
                    : <> until the end of your billing period.</>
                  }
                </p>
                <p>
                  {downgradeTarget === "FOUNDATION" ? (
                    <>After that, you move to Starter (free). No further charges.</>
                  ) : (
                    <>
                      New {TIER_DISPLAY_NAME[downgradeTarget] ?? downgradeTarget.charAt(0) + downgradeTarget.slice(1).toLowerCase()} plan begins at{" "}
                      <span className="font-data font-semibold">
                        {formatPrice(PLAN_CONFIG[downgradeTarget as Exclude<PlanTier, "FOUNDATION">]?.monthlyPrice ?? 0)}/mo
                      </span>.
                    </>
                  )}
                </p>
                <p className="text-muted">Your projects and data are never deleted.</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleDowngradeConfirm}
                disabled={managingPortal || downgradeLoading}
                className="px-3 py-1.5 text-[10px] font-medium border border-border text-earth rounded-lg hover:bg-surface-alt transition-colors disabled:opacity-40"
              >
                {managingPortal ? "Opening..." : "Continue to billing portal"}
              </button>
              <button
                onClick={() => setDowngradeTarget(null)}
                className="px-3 py-1.5 text-[10px] text-muted hover:text-earth transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ================================================================= */}
      {/* Enterprise Logo Upload                                             */}
      {/* ================================================================= */}
      {currentPlan === "ENTERPRISE" && (
        <>
          <SectionLabel>Organization Branding</SectionLabel>
          <Card padding="sm" className="mb-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
                <Image size={16} className="text-clay" />
              </div>
              <p className="text-[13px] font-medium text-earth">Organization Logo</p>
            </div>

            {profile?.orgLogo ? (
              <div className="flex items-center gap-3 p-2 border border-border rounded-lg bg-surface-alt">
                <img
                  src={profile.orgLogo}
                  alt="Organization logo"
                  className="max-h-10 max-w-[120px] object-contain"
                />
                <p className="flex-1 text-[10px] text-success font-medium">Uploaded</p>
                <button
                  onClick={async () => {
                    if (!user) return;
                    await update(ref(db, `users/${user.uid}/profile`), { orgLogo: null });
                    showToast("Logo removed.", "success");
                  }}
                  className="px-2.5 py-1 text-[10px] border border-border text-muted rounded-lg hover:text-danger hover:border-danger transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-1.5 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-clay/40 hover:bg-warm/30 transition-colors">
                <Upload size={20} className="text-muted" />
                <span className="text-[10px] text-muted">Upload logo (PNG or SVG, max 500KB)</span>
                <input
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !user) return;
                    if (file.size > 500 * 1024) {
                      showToast("Logo must be under 500KB.", "error");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const dataUrl = reader.result as string;
                      await update(ref(db, `users/${user.uid}/profile`), { orgLogo: dataUrl });
                      showToast("Logo uploaded.", "success");
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
          </Card>
        </>
      )}

      {/* ================================================================= */}
      {/* Trial Code Redemption (non-admin users)                            */}
      {/* ================================================================= */}
      {!isAdmin && (
        <>
          <SectionLabel>Trial Code</SectionLabel>
          <Card padding="sm" className="mb-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
                <Gift size={16} className="text-clay" />
              </div>
              <p className="text-[13px] font-medium text-earth">Redeem a trial code</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="e.g. KEY-48H-BUI-XXXX"
                className="flex-1 px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay font-mono tracking-wider input-focus"
              />
              <button
                onClick={handleRedeemTrialCode}
                disabled={redeeming || !redeemCode.trim()}
                className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 shrink-0"
              >
                {redeeming ? "Redeeming..." : "Redeem"}
              </button>
            </div>
          </Card>
        </>
      )}

      {/* ================================================================= */}
      {/* Admin: Market Data Cache Management                                */}
      {/* ================================================================= */}
      {isAdmin && (
        <>
          <SectionLabel>Market Data Cache</SectionLabel>
          <Card padding="sm" className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
                  <Database size={16} className="text-clay" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-earth">Location Data Cache</p>
                  <p className="text-[9px] text-muted">Census, HUD, BLS, FRED -- cached 7-30 days</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const { getAuthHeaders } = await import("@/lib/api-client");
                    const headers = await getAuthHeaders();
                    const res = await fetch("/api/location-data/clear-cache/", { method: "POST", headers });
                    const data = await res.json();
                    if (data.success) {
                      showToast("Location cache cleared.", "success");
                    } else {
                      showToast(data.error || "Failed to clear cache.", "error");
                    }
                  } catch {
                    showToast("Failed to clear cache.", "error");
                  }
                }}
                className="px-3 py-1.5 text-[10px] font-medium border border-warning text-warning rounded-lg hover:bg-warning/5 transition-colors shrink-0"
              >
                Clear cache
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
              <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-clay/10 text-clay rounded-full">
                Admin
              </span>
            </span>
          </SectionLabel>
          <Card padding="sm" className="mb-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
                <Gift size={16} className="text-clay" />
              </div>
              <p className="text-[13px] font-medium text-earth">Generate Trial Code</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">Tier</label>
                <select
                  value={trialTier}
                  onChange={(e) => setTrialTier(e.target.value as "BUILDER" | "DEVELOPER")}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
                >
                  <option value="BUILDER">Builder</option>
                  <option value="DEVELOPER">Developer</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">Duration</label>
                <select
                  value={trialDuration}
                  onChange={(e) => setTrialDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium uppercase tracking-wide mb-0.5">Max uses</label>
                <select
                  value={trialMaxUses}
                  onChange={(e) => setTrialMaxUses(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay"
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
              className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40 mb-2"
            >
              {generatingCode ? "Generating..." : "Generate Code"}
            </button>

            {generatedCode && (
              <div className="flex items-center gap-2 p-2 rounded-[var(--radius)] bg-success/5 border border-success/20 mb-3">
                <span className="text-[12px] font-mono font-semibold text-earth tracking-wider">{generatedCode}</span>
                <button
                  onClick={() => copyToClipboard(generatedCode)}
                  className="p-1 rounded-[var(--radius)] hover:bg-surface-alt transition-colors text-muted hover:text-earth"
                  title="Copy code"
                >
                  <Copy size={12} />
                </button>
              </div>
            )}

            {/* Active Codes Table */}
            {trialCodes.length > 0 && (
              <div className="border-t border-border pt-3 mt-1">
                <p className="text-[11px] font-semibold text-earth mb-2">Active Codes</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Code</th>
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Tier</th>
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Dur.</th>
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Uses</th>
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Expires</th>
                        <th className="text-left py-1.5 pr-2 text-[9px] text-muted font-medium uppercase tracking-wide">Status</th>
                        <th className="text-right py-1.5 text-muted font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialCodes.map((tc) => {
                        const status = getTrialCodeStatus(tc);
                        return (
                          <tr key={tc.code} className="border-b border-border/50">
                            <td className="py-1.5 pr-2 font-mono tracking-wider text-earth">{tc.code}</td>
                            <td className="py-1.5 pr-2 text-muted">{TIER_DISPLAY_NAME[tc.tier as PlanTier] ?? tc.tier.charAt(0) + tc.tier.slice(1).toLowerCase()}</td>
                            <td className="py-1.5 pr-2 text-muted">{tc.durationHours}h</td>
                            <td className="py-1.5 pr-2 text-muted">{tc.usedCount}/{tc.maxUses === 0 ? "Unl." : tc.maxUses}</td>
                            <td className="py-1.5 pr-2 text-muted">{new Date(tc.expiresAt).toLocaleDateString()}</td>
                            <td className="py-1.5 pr-2">
                              <span className={`inline-block px-1.5 py-0.5 text-[8px] font-semibold uppercase rounded-full ${
                                status === "active"
                                  ? "bg-success/10 text-success"
                                  : status === "expired"
                                  ? "bg-muted/10 text-muted"
                                  : "bg-danger/10 text-danger"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-1.5 text-right">
                              {status === "active" && (
                                <button
                                  onClick={() => handleRevokeTrialCode(tc.code)}
                                  disabled={revokingCode === tc.code}
                                  className="p-1 rounded-[var(--radius)] hover:bg-danger/5 text-muted hover:text-danger transition-colors disabled:opacity-40"
                                  title="Revoke code"
                                >
                                  <Trash2 size={12} />
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

      </>
      )}

      {/* ================================================================= */}
      {/* NOTIFICATIONS TAB                                                  */}
      {/* ================================================================= */}
      {settingsTab === "notifications" && (
      <>
      <SectionLabel>Notifications</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
            <Bell size={16} className="text-clay" />
          </div>
          <p className="text-[13px] font-medium text-earth">Notification Preferences</p>
        </div>

        <div className="space-y-1.5">
          {[
            { id: "budget_alerts", label: "Budget alerts", desc: "Spending exceeds thresholds", defaultOn: true },
            { id: "milestone_reminders", label: "Milestone reminders", desc: "Upcoming milestones and inspections", defaultOn: true },
            { id: "daily_summary", label: "Daily activity summary", desc: "End-of-day project recap", defaultOn: false },
            { id: "punch_list", label: "Punch list updates", desc: "Items added or resolved", defaultOn: true },
            { id: "weekly_digest", label: "Weekly project digest", desc: "Weekly email summary", defaultOn: false, requiresPlan: "BUILDER" as const },
          ].map((pref) => {
            const locked = pref.requiresPlan && ["FOUNDATION"].includes(currentPlan);
            return (
              <div key={pref.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[11px] text-earth font-medium">{pref.label}</p>
                  <p className="text-[9px] text-muted">{pref.desc}</p>
                </div>
                {locked ? (
                  <span className="text-[8px] text-muted bg-surface-alt px-1.5 py-0.5 rounded-full">
                    Builder+
                  </span>
                ) : (
                  <button
                    onClick={async () => {
                      if (!user) return;
                      const current = (profile as any)?.notifications?.[pref.id] ?? pref.defaultOn;
                      await update(ref(db, `users/${user.uid}/profile`), {
                        [`notifications/${pref.id}`]: !current,
                      });
                    }}
                    className={`relative w-8 h-[18px] rounded-full transition-colors ${
                      ((profile as any)?.notifications?.[pref.id] ?? pref.defaultOn)
                        ? "bg-success" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                      ((profile as any)?.notifications?.[pref.id] ?? pref.defaultOn)
                        ? "translate-x-[14px]" : "translate-x-0.5"
                    }`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Display preferences */}
      <SectionLabel>Display</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[11px] text-earth font-medium">Keystone Mentor</p>
            <p className="text-[9px] text-muted">Floating tips button in the bottom-right corner</p>
          </div>
          <button
            onClick={() => {
              const current = localStorage.getItem("keystone-mentor-disabled") === "true";
              localStorage.setItem("keystone-mentor-disabled", current ? "false" : "true");
              showToast(current ? "Mentor enabled" : "Mentor hidden — refresh to apply", "success");
            }}
            className={`relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors ${
              typeof window !== "undefined" && localStorage.getItem("keystone-mentor-disabled") === "true"
                ? "bg-sand/50"
                : "bg-success"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
              typeof window !== "undefined" && localStorage.getItem("keystone-mentor-disabled") === "true"
                ? "translate-x-0.5"
                : "translate-x-[14px]"
            }`} />
          </button>
        </div>
      </Card>

      </>
      )}

      {/* ================================================================= */}
      {/* DATA TAB                                                           */}
      {/* ================================================================= */}
      {settingsTab === "data" && (
      <>
      <SectionLabel>Data</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-warm flex items-center justify-center">
              <Database size={16} className="text-clay" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-earth">Export Data</p>
              <p className="text-[9px] text-muted">Profile and preferences as JSON</p>
            </div>
          </div>
          <button
            onClick={handleExportAll}
            className="px-3 py-1.5 text-[10px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors shrink-0"
          >
            Export
          </button>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* Data Management Section                                            */}
      {/* ================================================================= */}
      <SectionLabel>Data Management</SectionLabel>
      <Card padding="sm" className="mb-4">
        <div className="mb-4">
          {/* Reset All Data */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
              <Database size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-earth">Reset All Data</p>
              <p className="text-[9px] text-muted">Delete all projects but keep your account and preferences</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 text-[10px] border border-warning text-warning rounded-[var(--radius)] hover:bg-warning/5 transition-colors"
            >
              Reset all data
            </button>
          ) : (
            <div className="p-2.5 border border-warning rounded-[var(--radius)] bg-warning/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={13} className="text-warning" />
                <p className="text-[11px] font-medium text-warning">Confirm data reset</p>
              </div>
              <p className="text-[10px] text-muted mb-2">
                This permanently deletes ALL projects and data. Type RESET to confirm.
              </p>
              {resetError && (
                <p className="text-[10px] text-danger mb-1.5">{resetError}</p>
              )}
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Type RESET to confirm"
                className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-warning w-full mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAllData}
                  disabled={resetConfirmText !== "RESET" || resetting}
                  className="px-3 py-1.5 text-[10px] bg-warning text-white rounded-[var(--radius)] hover:bg-warning/90 transition-colors disabled:opacity-40"
                >
                  {resetting ? "Resetting..." : "Reset all data"}
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText("");
                    setResetError("");
                  }}
                  className="px-3 py-1.5 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3">
          {/* Delete Account Permanently */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle size={16} className="text-danger" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-danger">Delete Account</p>
              <p className="text-[9px] text-muted">Permanently remove account, all projects, and login credentials</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-[10px] border border-danger text-danger rounded-[var(--radius)] hover:bg-danger/5 transition-colors"
            >
              {t("settings.deleteAccount")}
            </button>
          ) : (
            <div className="p-2.5 border border-danger rounded-[var(--radius)] bg-danger/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={13} className="text-danger" />
                <p className="text-[11px] font-medium text-danger">Confirm account deletion</p>
              </div>
              <p className="text-[10px] text-muted mb-2">
                Type DELETE to confirm.
              </p>
              {deleteError && (
                <p className="text-[10px] text-danger mb-1.5">{deleteError}</p>
              )}
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-danger w-full mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="px-3 py-1.5 text-[10px] bg-danger text-white rounded-[var(--radius)] hover:bg-danger/90 transition-colors disabled:opacity-40"
                >
                  {deleting ? "Deleting..." : "Delete my account"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="px-3 py-1.5 text-[10px] border border-border rounded-[var(--radius)] text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
      </>
      )}
    </div>
  );
}
