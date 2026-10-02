"use client";

import { useActionState, useEffect } from "react";
import { verifyStatusPagePassword } from "@/actions/status-pages";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export function PasswordProtection({ pageId, title }: { pageId: string; title: string }) {
  const router = useRouter();

  // Wrapper for the server action to handle success/refresh
  const verifyAction = async (prevState: any, formData: FormData) => {
    const password = formData.get("password") as string;
    const res = await verifyStatusPagePassword(pageId, password);
    // If success, we want to reload the page to let the server render the protected content.
    // But server action returns plain object.
    // The instruction is to set cookie in action.
    // If action sets cookie, we just need to refresh.
    return res;
  };

  const [state, formAction, isPending] = useActionState(verifyAction, {
    success: false,
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Access Granted");
      router.refresh(); // Refresh to send new cookie
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-green-500/20">
      {/* Background Grid FX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 mb-4 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
            <Lock className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title} is Private</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest">Restricted Access Area</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest pl-1">
              Enter Password
            </label>
            <input
              type="password"
              name="password"
              autoFocus
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-sm text-center text-lg tracking-widest focus:border-green-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
            />
          </div>

          <button
            disabled={isPending}
            className="w-full bg-green-500 hover:bg-green-500/90 text-black font-bold uppercase tracking-widest py-4 rounded-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Unlock Page{" "}
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-[0.3em]">
          Encrypted & Protected Access Portal
        </p>
      </div>
    </div>
  );
}
