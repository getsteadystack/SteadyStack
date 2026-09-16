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
    <section className="bg-black/40 border border-primary/20 relative overflow-hidden backdrop-blur-sm group hover:border-primary/40 transition-all">
      {/* Corner Decor */}
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/30 group-hover:border-primary/60 transition-colors"></div>

      <div className="p-6 border-b border-primary/20 bg-primary/5">
        <h3 className="text-lg font-bold text-foreground font-mono uppercase tracking-tight">
          Regional Settings
        </h3>
        <p className="text-xs text-primary/60 font-mono">Synchronize time and date formats</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-mono">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-black border border-primary/20 focus:border-primary/60 text-white text-sm rounded-sm p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
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
          <label className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-mono">
            Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="bg-black border border-primary/20 focus:border-primary/60 text-white text-sm rounded-sm p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-mono">
            Time Format
          </label>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
            className="bg-black border border-primary/20 focus:border-primary/60 text-white text-sm rounded-sm p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
          >
            <option value="HH:mm">24-hour (14:30)</option>
            <option value="hh:mm a">12-hour (02:30 PM)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-mono">
            Language
          </label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="bg-black border border-primary/20 focus:border-primary/60 text-white text-sm rounded-sm p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel} ({l.code})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground font-mono">
            Overrides your browser language. The /es, /ja… URL prefix always wins.
          </p>
        </div>
      </div>

      <div className="flex justify-end p-6 border-t border-primary/10 mt-4 pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-black font-bold text-xs px-6 py-2.5 uppercase tracking-widest transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
