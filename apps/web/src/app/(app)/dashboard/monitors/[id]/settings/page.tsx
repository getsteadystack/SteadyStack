import { notFound, redirect } from "next/navigation";
import { getMonitor } from "@/actions/monitors";
import { MonitorSettingsView } from "@/components/monitors/settings-view";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { isEncrypted } from "@steadystack/core";

export const dynamic = "force-dynamic";

function parseJsonSafe(value: unknown): unknown {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Renders the monitor settings page.
 *
 * This function retrieves the user session and checks for authentication. If the user is not authenticated, it redirects to the login page. It then fetches the monitor details using the provided id from the parameters. If the monitor is not found, it triggers a not found response. Finally, it renders the MonitorForm component with the retrieved monitor data, ensuring it matches the expected format.
 *
 * @param {Object} params - An object containing the parameters for the function.
 * @param {Promise<{ id: string }>} params.params - A promise that resolves to an object containing the monitor id.
 */
export default async function MonitorSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  console.log(`[Debug] Fetching monitor settings for ID: ${id}`);

  const monitor = await getMonitor(id);

  if (!monitor) {
    console.warn(`[Debug] Monitor not found or unauthorized for ID: ${id}`);
    notFound();
  }

  // Cast because prisma types might be stale in this context but runtime is correct
  const windows = (monitor as any).maintenanceWindows || [];

  // Secrets never reach the browser: the headers column (encrypted envelope
  // or legacy plaintext credentials) and the clientCert bundle are stripped.
  // The form only learns whether protocol credentials (SMTP/FTP/MAIL) exist,
  // so an untouched edit keeps what is stored instead of wiping it.
  const m = monitor as any;
  const parsedHeaders = parseJsonSafe(m.headers);
  const hasProtocolCredentials =
    typeof m.headers === "string" &&
    m.headers.length > 0 &&
    !Array.isArray(parsedHeaders) &&
    (isEncrypted(m.headers) ||
      (parsedHeaders !== null &&
        typeof parsedHeaders === "object" &&
        ("username" in parsedHeaders || "password" in parsedHeaders)));
  const editableMonitor = {
    ...monitor,
    headers: null,
    clientCert: m.clientCert ? "configured" : null,
  } as any;

  return (
    <div className="flex justify-center p-6">
      <MonitorSettingsView
        monitor={editableMonitor}
        windows={windows}
        hasProtocolCredentials={hasProtocolCredentials}
      />
    </div>
  );
}
