"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <section className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden shadow-sm">
      <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl shrink-0">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-serif font-medium text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete account and all associated data. This action is irreversible.
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium px-4 py-2 rounded-xl border border-destructive/30 transition-all cursor-pointer whitespace-nowrap">
              Delete Account
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-[425px] rounded-2xl shadow-2xl p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-serif font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Confirm Account Deletion
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-3">
              <p className="text-xs text-muted-foreground border-l-2 border-destructive/50 pl-3 leading-relaxed">
                All active monitors, status pages, SLA records, and incident histories will be
                erased immediately.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DeleteConfirmButton />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function DeleteConfirmButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await authClient.deleteUser();
      // Sign out to clear the session cookie — without this the browser
      // still holds a valid-looking cookie even though the user row is gone.
      await authClient.signOut();
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to delete account");
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-500 hover:bg-red-600 font-mono uppercase tracking-widest"
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        "Confirm Delete"
      )}
    </Button>
  );
}
