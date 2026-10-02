import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StatusPagesPage() {
  redirect("/dashboard/clients" as any);
}
