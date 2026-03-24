"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lightbulb, Target, PiggyBank, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const differentiators = [
  {
    icon: Lightbulb,
    title: "We Know IT Financials",
    description: "We've sold for MSPs and worked in IT solutions. We understand MRR, project profitability, and how to structure your books for tech business success.",
    color: "bg-amber-500",
  },
  {
    icon: Target,
    title: "Proactive, Not Reactive",
    description: "Monthly financial reviews that spot trends before they become problems. We flag issues when they matter, not at year-end.",
    color: "bg-brand-500",
  },
  {
    icon: PiggyBank,
    title: "Tax Optimization",
    description: "We know every deduction available to tech companies—from home office setups to software subscriptions to equipment depreciation.",
    color: "bg-emerald-500",
  },
  {
    icon: Globe,
    title: "Remote-First",
    description: "Work with us from anywhere. Cloud-based systems, secure document sharing, and video meetings. In-person available in the Pacific Northwest.",
    color: "bg-violet-500",
  },
];

export function Differentiators() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".diff-header", {
        scrollTrigger: {
          trigger: ".diff-header",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
      });

      // Cards stagger
      gsap.from(".diff-card-gsap", {
        scrollTrigger: {
          trigger: ".diff-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="diff-header text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">Why Work With Us</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-6">
            Bookkeepers Who Speak Your Language
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            We combine technical financial expertise with deep understanding of the IT industry.
          </p>
        </div>

        {/* Grid */}
        <div className="diff-grid grid grid-cols-1 md:grid-cols-2 gap-8">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="diff-card-gsap feature-card group"
            >
              <div
                className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-navy-900 mb-3">
                {item.title}
              </h3>
              <p className="text-navy-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
