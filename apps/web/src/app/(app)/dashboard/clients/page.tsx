import { getClients } from "@/actions/clients";
import { getActiveWorkspace } from "@/actions/team";
import { getStatusPageAccessScope } from "@/actions/status-pages";
import prisma from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClientsClient } from "./clients-client";

export const metadata = {
  title: "Clients — SteadyStack",
  description: "Group your monitors by client and view uptime per account.",
};

export default async function ClientsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const active = await getActiveWorkspace();

  // All monitors scoped to this workspace (for the "add monitor" picker)
  const allMonitors = await prisma.monitor.findMany({
    where: active
      ? { organizationId: active.id }
      : { userId: session.user.id, organizationId: null },
    select: { id: true, name: true, clientId: true },
    orderBy: { name: "asc" },
  });

  const clients = await getClients();

  const pageScope = await getStatusPageAccessScope(session.user.id);
  const orphanedPages = await prisma.statusPage.findMany({
    where: {
      ...pageScope,
      clientId: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      customDomain: true,
      createdAt: true,
      _count: {
        select: { monitors: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ClientsClient
      initialClients={clients}
      allMonitors={allMonitors}
      orphanedPages={orphanedPages}
    />
  );
}
