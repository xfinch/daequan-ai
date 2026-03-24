import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  services: [
    { label: "Web Design", href: "#" },
    { label: "Development", href: "#" },
    { label: "Branding", href: "#" },
  ],
  social: [
    { label: "Twitter", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16 md:py-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              Studio
            </Link>
            <p className="mt-4 text-neutral-400 max-w-sm leading-relaxed">
              Creating award-winning digital experiences that combine stunning 
              design with exceptional performance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.social.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                {link.label}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
