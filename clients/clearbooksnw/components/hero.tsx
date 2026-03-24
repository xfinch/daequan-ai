"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      tl.from(".hero-bg", { opacity: 0, duration: 0.8 })
        .from(
          ".hero-badge",
          { opacity: 0, y: 20, duration: 0.6 },
          "-=0.4"
        )
        .from(
          ".hero-headline-word",
          {
            opacity: 0,
            y: 80,
            duration: 1,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .from(
          ".hero-subhead",
          { opacity: 0, y: 30, duration: 0.8 },
          "-=0.6"
        )
        .from(
          ".hero-cta-primary",
          { opacity: 0, y: 20, scale: 0.95, duration: 0.6 },
          "-=0.4"
        )
        .from(
          ".hero-cta-secondary",
          { opacity: 0, y: 20, duration: 0.6 },
          "-=0.4"
        )
        .from(
          ".hero-trust",
          { opacity: 0, y: 30, duration: 0.8 },
          "-=0.3"
        )
        .from(
          ".hero-scroll",
          { opacity: 0, duration: 0.6 },
          "-=0.2"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-brand"
    >
      {/* Content */}
      <div className="container-custom relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>40+ Years Combined Experience</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
            <span className="hero-headline-word inline-block">Bookkeeping</span>{" "}
            <span className="hero-headline-word inline-block">Built</span>{" "}
            <span className="hero-headline-word inline-block">for</span>{" "}
            <br className="hidden sm:block" />
            <span className="hero-headline-word inline-block text-cyan-300">IT</span>{" "}
            <span className="hero-headline-word inline-block text-cyan-300">&</span>{" "}
            <span className="hero-headline-word inline-block text-cyan-300">MSPs</span>
          </h1>

          {/* Subhead */}
          <p className="hero-subhead text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            We don&apos;t just balance your books—we understand your technology. 
            Deep expertise in bookkeeping meets real-world IT and MSP experience.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#contact"
              className="hero-cta-primary group inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl transition-all duration-300 hover:bg-cyan-50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
            >
              Schedule Free Consultation
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#why-us"
              className="hero-cta-secondary inline-flex items-center gap-2 px-8 py-4 text-white font-medium border-2 border-white/30 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/50"
            >
              Learn More
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="stat-number text-white mb-1">40+</div>
              <div className="text-white/60 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-white mb-1">IT</div>
              <div className="text-white/60 text-sm">Industry Specialists</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-white mb-1">MSP</div>
              <div className="text-white/60 text-sm">Service Provider Focus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}
