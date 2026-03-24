"use client";
import Link from "next/link";
import { useSocialLinks } from "@/contexts/SocialLinksContext";

export default function Footer() {
  const { socialLinks } = useSocialLinks();

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
              Discover cinematic explorations with cutting-edge analysis and
              blogs that elevate every adventure in film.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-muted-foreground/50 text-background dark:text-foreground hover:text-foreground transition-all duration-200"
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
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border dark:border-brand-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background dark:text-foreground">
              © {new Date().getFullYear()} Dhaka University Film Society. All
              rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-background dark:text-foreground">
              <Link
                href="#"
                className="hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors"
              >
                Terms of Publication
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
