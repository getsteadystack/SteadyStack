"use client";
// Safe layout comment trigger for UX audit

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Terminal } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 text-primary/40 hover:text-primary transition-colors">
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function ApiKeysForm() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [showRawKey, setShowRawKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cli/api-keys");
      const text = await res.text();
      if (!res.ok || !text) {
        setError(
          `Server error (${res.status}). Try refreshing — the dev server may need a restart.`,
        );
        return;
      }
      try {
        const data = JSON.parse(text);
        setKeys(data.keys ?? []);
      } catch {
        setError("Server returned an unexpected response. Try restarting the dev server.");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/cli/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const text = await res.text();
      if (!text) throw new Error(`Server error (${res.status})`);
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
      setNewRawKey(data.key.rawKey);
      setShowRawKey(true);
      setNewKeyName("");
      setShowForm(false);
      await loadKeys();
    } catch (err: any) {
      setError(err.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Revoke this API key? This action cannot be undone.")) return;
    try {
      await fetch(`/api/cli/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to revoke key");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <Key className="size-5 text-[#ffd439]" />
              API Keys
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authenticate the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-[11px] text-foreground">
                steadystack-cli
              </code>{" "}
              and programmatic webhooks
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-xl hover:bg-foreground/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="size-3.5" />
            New API Key
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="p-4 border-b border-border bg-muted/30 flex gap-3 items-center">
            <input
              autoFocus
              type="text"
              placeholder="Key description (e.g. GitHub Actions Deploy)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              className="flex-1 bg-card border border-border text-xs rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="bg-foreground text-background text-xs font-medium px-4 py-2 rounded-xl hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
            >
              {creating ? "Creating…" : "Generate"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground text-xs px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Newly created key reveal */}
        {newRawKey && (
          <div className="p-4 border-b border-border bg-emerald-500/10 border-l-4 border-l-emerald-600">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono font-semibold mb-2 uppercase tracking-wider">
              ✓ Key created — copy it now, it will not be displayed again
            </p>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground break-all">
                {showRawKey ? newRawKey : "•".repeat(Math.min(36, newRawKey.length))}
              </code>
              <button
                onClick={() => setShowRawKey((v) => !v)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                {showRawKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <CopyButton text={newRawKey} />
            </div>
            <button
              onClick={() => setNewRawKey(null)}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              I&apos;ve saved it securely — dismiss
            </button>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground font-mono text-xs uppercase animate-pulse">
            Loading keys…
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <div className="p-4 bg-muted rounded-2xl border border-border">
              <Key className="size-6 text-muted-foreground" />
            </div>
            <p className="font-serif text-base font-medium text-foreground">No API keys yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create an API key to use the CLI tool or integrate with continuous deployment
              pipelines.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{key.name}</span>
                    <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                      {key.scopes}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="text-foreground font-medium">{key.prefix}…</span>
                    <span>Created {timeAgo(key.createdAt)}</span>
                    <span>Last used {timeAgo(key.lastUsedAt)}</span>
                    {key.expiresAt && (
                      <span className="text-amber-600 dark:text-amber-400">
                        Expires {new Date(key.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-xl cursor-pointer"
                  title="Revoke key"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border-t border-destructive/20 text-xs text-destructive font-mono">
            {error}
          </div>
        )}
      </section>

      {/* CLI Quickstart */}
      <section className="rounded-2xl border border-border p-6 bg-card shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="size-4 text-foreground" />
          <h4 className="text-sm font-semibold text-foreground">CLI Quickstart</h4>
        </div>
        <div className="space-y-3">
          {[
            { label: "Install", cmd: "npm install -g steadystack-cli" },
            {
              label: "Login",
              cmd: "pulse auth login --key pg_live_...",
            },
            { label: "List", cmd: "pulse monitors list" },
            {
              label: "Apply",
              cmd: "pulse monitors apply -f steadystack.yaml",
            },
            {
              label: "CI/CD Gate",
              cmd: "pulse wait <monitor-id> --timeout 300",
            },
          ].map(({ label, cmd }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs text-muted-foreground font-mono w-24 shrink-0">{label}</span>
              <div className="flex items-center gap-2 bg-muted/40 border border-border px-3 py-2 flex-1 rounded-xl">
                <code className="text-xs font-mono text-foreground flex-1">{cmd}</code>
                <CopyButton text={cmd} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security note */}
      <section className="rounded-2xl border border-border p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Security Reminder:</strong> API keys grant full
          read/write access to your monitors and teams. Never commit keys into version control. Use
          environment variables or secret managers in CI/CD environments.
        </p>
      </section>
    </div>
  );
}
