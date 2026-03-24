import Link from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About", href: "#why-us" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ],
  services: [
    { label: "Bookkeeping", href: "#services" },
    { label: "Tax Preparation", href: "#services" },
    { label: "Advisory", href: "#services" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tight text-white"
            >
              Clearbooks
              <span className="text-brand-400">NW</span>
            </Link>
            <p className="mt-4 text-navy-400 max-w-sm leading-relaxed">
              Bookkeeping built for IT & MSPs. 40+ years of combined expertise
              in bookkeeping and IT solutions.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href="mailto:xavier@thetraffic.link"
                className="flex items-center gap-3 text-navy-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>xavier@thetraffic.link</span>
              </a>
              <div className="flex items-center gap-3 text-navy-400">
                <MapPin className="w-4 h-4" />
                <span>Pacific Northwest • Remote-First</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-navy-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-navy-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-navy-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-navy-500 text-sm">
            © {new Date().getFullYear()} Clearbooks NW. All rights reserved.
          </p>
          <p className="text-navy-600 text-sm">
            Remote-first • Serving tech businesses nationwide
          </p>
        </div>
      </div>
    </footer>
  );
}
