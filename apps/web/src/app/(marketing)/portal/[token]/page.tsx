import type { Metadata } from "next";
import { getPortalClientData } from "@/actions/clients";
import { PortalClient } from "./portal-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await getPortalClientData(token);

  if ("error" in data || data.requiresPin) {
    return {
      title: "Client SLA Portal | Infrastructure Telemetry",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${data.client.name} — Live SLA & Infrastructure Portal`,
    description: `Real-time availability, performance metrics, and SLA status for ${data.client.name}. Managed by ${data.client.agencyName}.`,
    robots: { index: false, follow: false },
  };
}

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const initialData = await getPortalClientData(token);

  return <PortalClient token={token} initialData={initialData} />;
}
