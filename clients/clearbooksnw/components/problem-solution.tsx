"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    title: "Reactive Bookkeeping",
    description: "Waiting until tax season to discover cash flow problems that could have been prevented months ago.",
  },
  {
    title: "Missed Tax Savings",
    description: "Not capturing R&D credits, equipment depreciation, and tech-specific deductions that IT companies qualify for.",
  },
  {
    title: "Generic Advice",
    description: "Bookkeepers who don't understand recurring revenue, project billing, or SaaS metrics unique to tech.",
  },
  {
    title: "Scalability Blindspots",
    description: "Missing the financial patterns that predict growth opportunities or warning signs of trouble ahead.",
  },
];

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".ps-header", {
        scrollTrigger: {
          trigger: ".ps-header",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
      });

      // Pain cards stagger
      gsap.from(".pain-card-gsap", {
        scrollTrigger: {
          trigger: ".pain-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Solution box
      gsap.from(".solution-box-gsap", {
        scrollTrigger: {
          trigger: ".solution-box-gsap",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        scale: 0.98,
        duration: 0.8,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="why-us" className="section-padding bg-navy-50">
      <div className="container-custom">
        {/* Header */}
        <div className="ps-header text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">The Problem</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-6">
            Why Tech Companies Struggle
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            We know where IT businesses fail financially—because we&apos;ve been in your world.
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="pain-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {painPoints.map((point, index) => (
            <div
              key={point.title}
              className="pain-card-gsap pain-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-red-900 mb-2">
                    {point.title}
                  </h3>
                  <p className="text-red-700/80 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solution Box */}
        <div className="solution-box-gsap solution-card">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-display text-xl md:text-2xl font-bold text-emerald-900 mb-2">
                The Clearbooks NW Difference
              </h3>
              <p className="text-emerald-800/90 leading-relaxed">
                We combine deep bookkeeping expertise with real-world IT and MSP sales experience. 
                We understand your business models—from managed services contracts to project-based work—
                so we catch what generic bookkeepers miss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
