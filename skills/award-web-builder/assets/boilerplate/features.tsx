"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Palette, Zap, Shield, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Palette,
    title: "Stunning Design",
    description:
      "Award-winning aesthetics that capture attention and communicate brand value instantly.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized performance that loads in under 3 seconds and keeps users engaged.",
  },
  {
    icon: Shield,
    title: "Built to Scale",
    description:
      "Modern architecture that grows with your business and adapts to new requirements.",
  },
  {
    icon: Sparkles,
    title: "Delightful UX",
    description:
      "Intuitive interactions and smooth animations that make browsing a pleasure.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".features-header", {
        scrollTrigger: {
          trigger: ".features-header",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
      });

      // Cards stagger animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="features-header text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium tracking-widest uppercase text-neutral-500 mb-4">
            Why Choose Us
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Built for excellence
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Every project we undertake follows award-winning principles of design, 
            performance, and user experience.
          </p>
        </div>

        {/* Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card group p-8 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
