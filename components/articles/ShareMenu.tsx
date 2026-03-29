"use client";

import React, { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Copy, Mail, MessageCircle, Share2, Instagram } from "lucide-react";
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

  useEffect(() => {
    setUrl(_url || window.location.href);
    setTitle(_title || (typeof document !== "undefined" ? document.title : ""));
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [_url, _title]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    mail: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };

  const openPopup = (url: string) => {
    window.open(url, "share-popup", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.share({ url, title });
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
        <Facebook className="w-4 h-4 text-[#1877F2]" />
        <span>Facebook</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.twitter)} className="flex items-center gap-3 py-2">
        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
        <span>Twitter</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.whatsapp)} className="flex items-center gap-3 py-2">
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
        <span>WhatsApp</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => openPopup(shareLinks.linkedin)} className="flex items-center gap-3 py-2">
        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
        <span>LinkedIn</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => window.location.href = shareLinks.mail} className="flex items-center gap-3 py-2">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <span>Email</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-3 py-2 border-t border-border mt-1">
        <Copy className="w-4 h-4 text-muted-foreground" />
        <span>Copy Link</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
