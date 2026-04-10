"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useSocialLinks } from "@/contexts/SocialLinksContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";
import { strapiAPI } from "@/lib/api";

export default function Footer() {
  const { socialLinks } = useSocialLinks();
  const { user } = useAuth();
  const toast = useToast();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportIssueText, setReportIssueText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportIssue = async () => {
    if (!reportIssueText.trim()) return;

    setIsSubmittingReport(true);
    console.log("Current User ID:", user?.id); // Debugging log
    try {
      const payload: any = {
        section: "IssueReportFooter",
        description: reportIssueText,
      };

      if (user?.id) {
        payload.userId = user.id;
      }

      await strapiAPI.createUserRequestReport(payload);
      toast.success("Your report has been submitted successfully.");
      setIsReportModalOpen(false);
      setReportIssueText("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit your report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <footer className="border-t border-border overflow-x-hidden bg-brand-black-100">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <img
                src="/images/logoo.png"
                alt="DUFS Logo"
                className="h-12 w-14 object-contain"
              />
              <span className="text-2xl font-black text-background dark:text-foreground">
                DUFS Blog
              </span>
            </Link>
            <p className="text-base text-background dark:text-foreground leading-relaxed mb-6 max-w-sm">
              Explore critical perspectives on cinema, culture, and visual storytelling. Curated by Dhaka University Film Society.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-white text-background dark:text-foreground hover:text-foreground transition-all duration-200"
                  aria-label={`Visit our ${link.platform} page`}
                >
                  {link.icon ? (
                    <img
                      src={link.icon}
                      alt={`${link.platform} icon`}
                      className="w-[17px] h-[17px] object-contain"
                    />
                  ) : (
                    <span className="uppercase text-xs font-semibold">
                      {link.platform.charAt(0)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-4 text-background dark:text-foreground">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Browse Articles
                </Link>
              </li>
              <li>
                <Link
                  href="https://dufs.org"
                  target="_blank"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  About DUFS
                </Link>
              </li>
              <li>
                <Link
                  href="https://iiusff.dufs.org"
                  target="_blank"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  IIUSFF
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-4 text-background dark:text-foreground">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/submit"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Submit Writing
                </Link>
              </li>
              <li>
                <Link
                  href="/author"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Authors
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signin"
                  className="text-base text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-4 text-background dark:text-foreground">
              Contact
            </h3>
            <ul className="space-y-3 text-base text-background dark:text-foreground">
              <li>
                <span className="block font-medium text-background dark:text-foreground mb-1">
                  Address
                </span>
                1st floor, TSC, University of Dhaka
                <br />
                Dhaka 1000, Bangladesh
              </li>
              <li>
                <span className="block font-medium text-background dark:text-foreground mb-1">
                  Email
                </span>
                <a
                  href="mailto:info@blog.dufs.org"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  info@blog.dufs.org
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-gray-300 hover:text-white hover:underline transition-colors font-medium flex items-center gap-2 cursor-pointer"
                >
                  Report Issue
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dashed border-border dark:border-brand-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background dark:text-foreground">
              © {new Date().getFullYear()} Dhaka University Film Society. All
              rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-background dark:text-foreground">
              {/* <Link
                href="#"
                className="whitespace-nowrap hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors"
              >
                Privacy Policy
              </Link> */}
              <Link
                href="/terms-and-conditions"
                className="whitespace-nowrap text-white/80 hover:text-white transition-colors"
              >
                Terms of Publication
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border border-border p-6 md:p-8 rounded-lg shadow-lg animate-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-foreground">Report Issue</h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-medium">
              Please describe the issue you encountered. We will review and take action.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1.5">
                  Issue Description
                </label>
                <textarea
                  value={reportIssueText}
                  onChange={(e) => setReportIssueText(e.target.value)}
                  placeholder="Describe the issue you're experiencing..."
                  rows={4}
                  className="w-full bg-muted border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-3 px-4 outline-none transition-all text-sm font-medium resize-none"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleReportIssue}
                  disabled={!reportIssueText.trim() || isSubmittingReport}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold uppercase tracking-wide text-xs rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold uppercase tracking-wide text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

