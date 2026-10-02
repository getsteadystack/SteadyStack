import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MonitorManager } from "@/components/monitors/monitor-manager";
import { getMonitors } from "@/actions/monitors";
import { getActiveWorkspace } from "@/actions/team";
import prisma from "@steadystack/db";

export const dynamic = "force-dynamic";

export default async function MonitorsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const active = await getActiveWorkspace();

  const [monitors, clients] = await Promise.all([
    getMonitors(),
    prisma.client.findMany({
      where: active
        ? { organizationId: active.id }
        : { userId: session.user.id, organizationId: null },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <MonitorManager initialMonitors={monitors} clients={clients} />;
}
