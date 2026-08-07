import Link from "next/link";
import { navLinks, siteConfig, socialLinks } from "@/data/portfolio";
import { getCurrentYear } from "@/lib/utils";

const validSocialLinks = socialLinks.filter((social) => {
  const url = String(social.url);
  if (!url || url === "#" || url === "mailto:" || url.startsWith("Add ") || url.startsWith("mailto:Add ")) {
    return false;
  }
  return true;
});

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold tracking-widest text-text-primary">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Student Developer and Digital Creator
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-accent-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social links */}
          {validSocialLinks.length > 0 && (
            <div className="flex gap-4">
              {validSocialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="text-sm text-text-secondary transition-colors hover:text-accent-blue"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border-subtle pt-6 text-center">
          <p className="text-xs text-text-muted">
            &copy; {getCurrentYear()} {siteConfig.name}. Designed and built by
            Lin.
          </p>
        </div>
      </div>
    </footer>
  );
}
