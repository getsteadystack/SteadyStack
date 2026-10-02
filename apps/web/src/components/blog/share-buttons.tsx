"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleCopy = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareX = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`"${title}" by @SteadyStack`);
    const shareHref = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(shareHref, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getShareUrl();
    const shareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(shareHref, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[#5c5c5c] hover:text-[#23211a] bg-white hover:bg-[#f0ede6] border border-[#e8e6df] transition-all duration-200 shadow-xs cursor-pointer"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-emerald-600" />
            <span className="text-emerald-700 text-xs">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="size-3.5" />
            <span>Copy link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleShareX}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[#5c5c5c] hover:text-[#23211a] bg-white hover:bg-[#f0ede6] border border-[#e8e6df] transition-all duration-200 shadow-xs cursor-pointer"
        title="Share on X / Twitter"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Post</span>
      </button>

      <button
        type="button"
        onClick={handleShareLinkedIn}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[#5c5c5c] hover:text-[#23211a] bg-white hover:bg-[#f0ede6] border border-[#e8e6df] transition-all duration-200 shadow-xs cursor-pointer"
        title="Share on LinkedIn"
      >
        <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
        <span>LinkedIn</span>
      </button>
    </div>
  );
}

export default ShareButtons;
