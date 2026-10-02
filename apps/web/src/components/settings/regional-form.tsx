"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

import { updateUserPreferences } from "@/actions/user";
import { LOCALES } from "@/i18n/locales";
import { useRouter } from "next/navigation";

export function RegionalForm() {
  const { data: session } = authClient.useSession();
  const router = useRouter(); // Add router
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("HH:mm");
  const [locale, setLocale] = useState("en");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // @ts-expect-error - additionalFields are not yet typed in client
      if (session.user.timezone) setTimezone(session.user.timezone);
      // @ts-expect-error - additionalFields are not yet typed in client
      if (session.user.dateFormat) setDateFormat(session.user.dateFormat);
      // @ts-expect-error - additionalFields are not yet typed in client
      if (session.user.timeFormat) setTimeFormat(session.user.timeFormat);
      // @ts-expect-error - additionalFields are not yet typed in client
      if (session.user.locale) setLocale(session.user.locale);
    }
  }, [session]);

  const handleSave = async () => {
    setIsPending(true);
    try {
      // Use repeated calls or Promise.all if we wanted to keep authClient in sync immediately
      // But server action is more reliable for custom fields until types regenerate
      const result = await updateUserPreferences({
        timezone,
        dateFormat,
        timeFormat,
        locale,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Also try to update client session optimistically for immediate UI feedback if needed
      await authClient.updateUser({
        // @ts-expect-error - additionalFields are not yet typed in client
        timezone,
        dateFormat,
        timeFormat,
        locale,
      });

      toast.success("Regional settings updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h3 className="text-lg font-serif font-medium text-foreground">Regional Settings</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Synchronize your timezone, language, and date formats
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
          >
            <option value="UTC">(GMT+00:00) UTC</option>
            <option value="America/Los_Angeles">(GMT-08:00) Pacific Time</option>
            <option value="America/New_York">(GMT-05:00) Eastern Time</option>
            <option value="Europe/London">(GMT+00:00) London</option>
            <option value="Europe/Paris">(GMT+01:00) Central European Time</option>
            <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Date Format</label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Time Format</label>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
            className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
          >
            <option value="HH:mm">24-hour (14:30)</option>
            <option value="hh:mm a">12-hour (02:30 PM)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Language</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel} ({l.code})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground font-mono">
            Overrides browser language. URL prefixes (/es, /ja) take precedence.
          </p>
        </div>
      </div>

      <div className="flex justify-end p-6 border-t border-border bg-muted/10">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
