"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!heroRef.current || !headlineRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      tl.from(".hero-bg", {
        opacity: 0,
        duration: 0.6,
      })
        .from(
          ".hero-label",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          "-=0.3"
        )
        .from(
          ".hero-headline-word",
          {
            opacity: 0,
            y: 60,
            duration: 0.8,
            stagger: 0.1,
          },
          "-=0.4"
        )
        .from(
          ".hero-subhead",
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-cta",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          "-=0.3"
        )
        .from(
          ".hero-scroll",
          {
            opacity: 0,
            duration: 0.6,
          },
          "-=0.2"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-white" />
      
      {/* Content */}
      <div className="container-custom relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Label */}
          <p className="hero-label text-sm font-medium tracking-widest uppercase text-neutral-500 mb-6">
            Award-Winning Design Studio
          </p>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            <span className="hero-headline-word inline-block">We</span>{" "}
            <span className="hero-headline-word inline-block">create</span>{" "}
            <span className="hero-headline-word inline-block text-gradient">digital</span>{" "}
            <span className="hero-headline-word inline-block">experiences</span>
          </h1>

          {/* Subhead */}
          <p className="hero-subhead text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crafting award-winning websites that combine stunning design with 
            exceptional user experience. Built to convert, designed to impress.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary w-full sm:w-auto">
              View Our Work
            </button>
            <button className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
              Get in Touch
              <ArrowDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-neutral-300 animate-pulse" />
      </div>
    </section>
  );
}
