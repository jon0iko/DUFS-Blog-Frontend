"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

interface ShareMenuProps {
  children: React.ReactNode;
  url?: string;
  title?: string;
  align?: "left" | "right";
  directNativeShare?: boolean;
}

export default function ShareMenu({ children, url: _url, title: _title = "", align = "right", directNativeShare = false }: ShareMenuProps) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  const getShareUrl = () => {
    if (_url) return _url;
    if (typeof window === "undefined") return "";

    const currentUrl = new URL(window.location.href);
    const slugFromQuery = currentUrl.searchParams.get("slug");

    // Ensure social apps receive the SEO route that has static OG metadata.
    if (currentUrl.pathname === "/read-article" && slugFromQuery) {
      return new URL(`/articles/${slugFromQuery}`, currentUrl.origin).toString();
    }

    currentUrl.hash = "";
    return currentUrl.toString();
  };

  useEffect(() => {
    setUrl(getShareUrl());
    setTitle(_title || (typeof document !== "undefined" ? document.title : ""));
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [_url, _title]);

  const shareUrl = url || getShareUrl();
  const shareTitle = title || _title || (typeof document !== "undefined" ? document.title : "");

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const socialIconClass = "w-4 h-4 dark:brightness-0 dark:invert";

  const openPopup = (popupUrl: string) => {
    const width = 640;
    const height = 720;
    const left = Math.max(0, Math.round((window.innerWidth - width) / 2 + window.screenX));
    const top = Math.max(0, Math.round((window.innerHeight - height) / 2 + window.screenY));

    const popup = window.open(
      popupUrl,
      "share-popup",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    } else {
      toast.error("Popup was blocked. Please allow popups for this site.");
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const didCopy = document.execCommand("copy");
    document.body.removeChild(textarea);
    return didCopy;
  };

  const copyToClipboard = async () => {
    if (!shareUrl) {
      toast.error("No share URL available right now.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const copied = copyToClipboardFallback(shareUrl);
        if (!copied) {
          throw new Error("Clipboard fallback failed");
        }
      }
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        copyToClipboard();
      }
    }
  };

  if (directNativeShare && hasNativeShare && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleNativeShare
    });
  }

  return (
    <DropdownMenu trigger={children} align={align}>
      {hasNativeShare && (
        <DropdownMenuItem onClick={handleNativeShare} className="flex items-center gap-3 py-2">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span>Native Share</span>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => openPopup(shareLinks.facebook)} className="flex items-center gap-3 py-2">
        <Image src="/images/social/facebook.svg" alt="" aria-hidden width={16} height={16} className={socialIconClass} />
        <span>Facebook</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.twitter)} className="flex items-center gap-3 py-2">
        <Image src="/images/social/x.svg" alt="" aria-hidden width={16} height={16} className={socialIconClass} />
        <span>X</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.whatsapp)} className="flex items-center gap-3 py-2">
        <Image src="/images/social/whatsapp.svg" alt="" aria-hidden width={16} height={16} className={socialIconClass} />
        <span>WhatsApp</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.linkedin)} className="flex items-center gap-3 py-2">
        <Image src="/images/social/linkedin.svg" alt="" aria-hidden width={16} height={16} className={socialIconClass} />
        <span>LinkedIn</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-3 py-2 border-t border-border mt-1">
        <Copy className="w-4 h-4 text-muted-foreground" />
        <span>Copy Link</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
