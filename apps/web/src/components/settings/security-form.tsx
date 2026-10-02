"use client";

import { Smartphone, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";

/**
 * Renders a security form for managing two-factor authentication and password changes.
 */
export function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdatePassword = async () => {
    setMessage(null);

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to update password",
        });
        toast.error(error.message || "Failed to update password");
      } else {
        setMessage({ type: "success", text: "Password updated successfully" });
        toast.success("Password updated successfully");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 2FA Section */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="text-lg font-serif font-medium text-foreground">
            Two-Factor Authentication
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Enhance account security protocols</p>
        </div>
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted border border-border rounded-xl">
              <Smartphone className="size-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-foreground">Authenticator App (TOTP)</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Use an authenticator app like 1Password, Google Authenticator or Authy to generate
                one-time verification codes.
              </p>
            </div>
          </div>
          <button
            disabled
            className="bg-muted text-muted-foreground border border-border text-xs font-mono font-medium px-3.5 py-1.5 rounded-xl cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </section>

      {/* Password Change */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="text-lg font-serif font-medium text-foreground">Password Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update your account login password</p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-4 max-w-xl">
          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-destructive" />
              )}
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                className="w-full bg-card border border-border text-foreground text-xs rounded-xl pl-9 pr-4 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                className="w-full bg-card border border-border text-foreground text-xs rounded-xl pl-9 pr-4 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                className="w-full bg-card border border-border text-foreground text-xs rounded-xl pl-9 pr-4 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="bg-foreground hover:bg-foreground/90 text-background text-xs font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
