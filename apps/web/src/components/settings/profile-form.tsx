"use client";

import { Camera, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "@/components/ui/sonner";

export function ProfileForm() {
  const { data: session } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optimisticImage, setOptimisticImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Sync name from session
  if (session?.user?.name && !name) {
    setName(session.user.name);
  }

  const handleSave = async () => {
    setIsPending(true);
    try {
      await authClient.updateUser({
        name: name,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!session?.user?.image && !optimisticImage) return;

    setIsRemoving(true);
    try {
      await authClient.updateUser({
        image: "", // Clear the image
      });
      setOptimisticImage(null);
      toast.success("Profile image removed");
    } catch (error) {
      toast.error("Failed to remove profile image");
      console.error(error);
    } finally {
      setIsRemoving(false);
    }
  };

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        const newImageUrl = res[0].url;
        setOptimisticImage(newImageUrl);
        try {
          await authClient.updateUser({
            image: newImageUrl,
          });
          toast.success("Profile image updated successfully");
        } catch (error) {
          toast.error("Failed to update profile image");
          console.error(error);
        }
      }
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return;
    }

    await startUpload([file]);
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h3 className="text-lg font-serif font-medium text-foreground">Profile Information</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update your account details and profile photo
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group/avatar cursor-pointer">
            <div className="relative size-20 rounded-full overflow-hidden bg-muted border-2 border-border p-1">
              <Image
                alt="Avatar"
                fill
                sizes="80px"
                className="object-cover rounded-full"
                src={
                  optimisticImage ||
                  session?.user?.image ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxSYTgfX2U4lnnYl1yKNWL9eNJG3Lj1p_plRCe12llLiayEVV3biVu6yC0OGWk3Mti3J0YGrFtTWUwGNJvt6Y4-8l_L8i_N-MjEaZ6JAC8uPa9FJ-Cl8tbFv41OFaIu_4duPeo7UcdgXPXxnHSgArtMEkKZddUpSqnWuI5wzbxkFCrGBvWmTatIm8JIm2KhGv0gNieFcvCO3LdXUbrmfdrMyCTSSXZAR1GeVA5__te0JJ80IJkzNCgXrwfGbJ_gcu_4pyoVHeN6oI7"
                }
              />
              {isUploading && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-foreground size-6" />
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-not-allowed"
            >
              <Camera className="text-background size-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-muted hover:bg-muted/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileSelect}
              />
              <button
                onClick={handleRemoveImage}
                disabled={isRemoving || (!session?.user?.image && !optimisticImage)}
                className="text-destructive hover:bg-destructive/10 text-xs font-medium px-3.5 py-1.5 rounded-xl border border-destructive/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">JPG, GIF or PNG up to 4MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Full Name</label>
            <input
              className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Email Address</label>
            <input
              className="bg-muted/50 border border-border text-muted-foreground text-xs rounded-xl p-2.5 cursor-not-allowed"
              type="email"
              value={session?.user?.email ?? ""}
              readOnly
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
