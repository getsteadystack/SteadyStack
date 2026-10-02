"use client";

import { useActionState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createStatusPage } from "@/actions/status-pages";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Link as LinkIcon, Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const initialState = { success: false, error: "" };

export function CreateStatusPageModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createStatusPage, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Status page created!");
      onClose();
      if (state.id) {
        router.push(`/dashboard/pages/${state.id}`);
      } else {
        router.refresh();
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onClose, router]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl font-medium text-foreground">
            <Globe className="size-5 text-foreground" /> New Status Page
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4 mt-2">
          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
              Slug (URL Identifier)
            </label>
            <div className="flex items-center border border-border bg-background rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-foreground/20">
              <span className="pl-3 text-xs text-muted-foreground font-mono">/status-page/</span>
              <input
                name="slug"
                required
                placeholder="my-company"
                className="flex-1 bg-transparent border-none text-foreground text-sm p-2 font-mono placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Public URL: steadystack.dev/status-page/slug
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
              Page Title
            </label>
            <input
              name="title"
              required
              placeholder="Acme Inc. Status"
              className="w-full bg-background border border-border focus:border-foreground/30 text-foreground text-sm rounded-xl p-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Custom Domain (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
              <LinkIcon className="size-3" /> Custom Domain (Optional)
            </label>
            <input
              name="customDomain"
              placeholder="status.example.com"
              className="w-full bg-background border border-border focus:border-foreground/30 text-foreground text-sm rounded-xl p-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Password (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
              <Lock className="size-3" /> Password (Optional)
            </label>
            <input
              name="password"
              type="password"
              placeholder="Leave blank for public access"
              className="w-full bg-background border border-border focus:border-foreground/30 text-foreground text-sm rounded-xl p-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-foreground hover:bg-foreground/90 text-background text-xs font-medium transition-colors rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Create Page
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
