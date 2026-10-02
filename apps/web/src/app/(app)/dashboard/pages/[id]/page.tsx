import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getStatusPage } from "@/actions/status-pages";
import { getMonitors } from "@/actions/monitors";
import { StatusPageEditor } from "@/components/status-pages/status-page-editor";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Renders the status page editor for a specific page.
 *
 * Wraps StatusPageEditor in NextIntlClientProvider so next-intl hooks
 * (useLocale, useFormatters, etc.) work inside child components like
 * MaintenanceTimeline even though this route lives outside the [locale] tree.
 */
export default async function EditStatusPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const page = await getStatusPage(id);
  if (!page) notFound();

  const allMonitors = await getMonitors();
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <StatusPageEditor page={page} allMonitors={allMonitors} />
    </NextIntlClientProvider>
  );
}
