"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power2.out",
    });
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo - no link, keeps user on landing page */}
          <span className="font-display text-2xl font-bold tracking-tight text-navy-900 cursor-default">
            Clearbooks
            <span className="text-brand-500">NW</span>
          </span>

          {/* Desktop - Only CTA button */}
          <div className="hidden md:flex items-center">
            <Link href="#contact" className="btn-primary text-sm">
              Free Consultation
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-navy-900"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Only CTA */}
      <div
        className={`md:hidden fixed inset-0 top-20 bg-white transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link
            href="#contact"
            className="btn-primary text-xl"
            onClick={() => setIsOpen(false)}
          >
            Free Consultation
          </Link>
        </div>
      </div>
    </nav>
  );
}
