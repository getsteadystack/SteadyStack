"use client";

import { useState } from "react";
import {
  KeyRound,
  Link as LinkIcon,
  Copy,
  Check,
  ArrowUpRight,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
} from "lucide-react";
import {
  generateClientPortalToken,
  revokeClientPortalToken,
  updateClientPortalSettings,
} from "@/actions/clients";
import { toast } from "sonner";

interface ClientPortalPanelProps {
  clientId: string;
  clientName: string;
  clientColor: string;
  initialToken: string | null;
  initialPortalEnabled: boolean;
  hasPin: boolean;
}

export function ClientPortalPanel({
  clientId,
  clientName,
  clientColor,
  initialToken,
  initialPortalEnabled,
  hasPin,
}: ClientPortalPanelProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [enabled, setEnabled] = useState<boolean>(initialPortalEnabled);
  const [pinEnabled, setPinEnabled] = useState<boolean>(hasPin);
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const portalUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${token}`
    : null;

  const handleGenerateToken = async () => {
    setLoading(true);
    const res = await generateClientPortalToken(clientId);
    setLoading(false);

    if (res.success && res.token) {
      setToken(res.token);
      setEnabled(true);
      toast.success("Client portal link generated");
    } else {
      toast.error(res.error || "Failed to generate portal link");
    }
  };

  const handleRevokeToken = async () => {
    if (
      !confirm("Revoke this client portal link? The existing link will immediately stop working.")
    ) {
      return;
    }
    setLoading(true);
    const res = await revokeClientPortalToken(clientId);
    setLoading(false);

    if (res.success) {
      setToken(null);
      setEnabled(false);
      setPinEnabled(false);
      setPin("");
      toast.success("Client portal link revoked");
    } else {
      toast.error(res.error || "Failed to revoke portal link");
    }
  };

  const handleSavePinSettings = async () => {
    setLoading(true);
    const res = await updateClientPortalSettings(clientId, {
      portalEnabled: enabled,
      pin: pinEnabled ? pin : null,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Portal settings saved");
    } else {
      toast.error(res.error || "Failed to update portal settings");
    }
  };

  const handleCopy = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    toast.success("Portal link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 border-t border-border/20 bg-muted/5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Client Read-Only SLA Portal
          </span>
        </div>
        {token && (
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
              enabled
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-muted-foreground bg-muted border-border"
            }`}
          >
            {enabled ? "Portal Live" : "Portal Disabled"}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Give <span className="font-semibold text-foreground">{clientName}</span> a private,
        white-label link to view their live uptime, latency metrics, and SLA status without creating
        an account.
      </p>

      {/* No token generated yet */}
      {!token ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-dashed border-border/80 bg-background/50">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">No active share link</p>
            <p className="text-[11px] text-muted-foreground">
              Generate a unique tokenized URL for this client.
            </p>
          </div>
          <button
            onClick={handleGenerateToken}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LinkIcon className="size-3.5" />
            )}
            <span>Generate Portal Link</span>
          </button>
        </div>
      ) : (
        /* Active Portal Link & Controls */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs text-foreground truncate select-all">
              <LinkIcon className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{portalUrl}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors cursor-pointer"
                title="Copy link"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <a
                href={`/portal/${token}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-mono font-medium transition-colors"
                title="Preview portal"
              >
                <span>Open</span>
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>

          {/* Passcode Security & Regeneration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* PIN Passcode setting */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinEnabled}
                    onChange={(e) => {
                      setPinEnabled(e.target.checked);
                      if (!e.target.checked) setPin("");
                    }}
                    className="size-3.5 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span>Passcode PIN Protection</span>
                </label>
                {pinEnabled ? (
                  <Lock className="size-3.5 text-amber-500" />
                ) : (
                  <Unlock className="size-3.5 text-muted-foreground" />
                )}
              </div>

              {pinEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder={hasPin && !pin ? "•••• (PIN Active)" : "Set new 4-digit PIN"}
                      maxLength={12}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPin ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSavePinSettings}
                    disabled={loading || (!pin.trim() && !hasPin)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Token Management */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-card flex flex-col justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-foreground">Access Management</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Regenerate token if shared accidentally or revoke access completely.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleGenerateToken}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleRevokeToken}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-xs font-mono text-destructive transition-colors cursor-pointer"
                >
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
