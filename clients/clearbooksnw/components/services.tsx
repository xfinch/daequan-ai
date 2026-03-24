"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart3,
  RefreshCw,
  LineChart,
  Users,
  FileText,
  MessagesSquare,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: BarChart3,
    title: "Monthly Bookkeeping",
    description: "Clean, accurate books delivered monthly with insights tailored to recurring revenue and project-based businesses.",
  },
  {
    icon: RefreshCw,
    title: "Cleanup & Catch-Up",
    description: "Behind on your books? We'll get you current and establish systems that keep you there.",
  },
  {
    icon: LineChart,
    title: "Financial Reporting",
    description: "Custom dashboards and reports that show the metrics IT business owners actually care about.",
  },
  {
    icon: Users,
    title: "Payroll Services",
    description: "Accurate payroll processing for your team, including contractor 1099 management.",
  },
  {
    icon: FileText,
    title: "Tax Preparation",
    description: "Strategic tax planning and filing that maximizes deductions specific to tech businesses.",
  },
  {
    icon: MessagesSquare,
    title: "Advisory Services",
    description: "Fractional CFO-level guidance to help you make smart financial decisions as you scale.",
  },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".services-header", {
        scrollTrigger: {
          trigger: ".services-header",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
      });

      // Cards stagger
      gsap.from(".service-card-gsap", {
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="section-padding bg-navy-50">
      <div className="container-custom">
        {/* Header */}
        <div className="services-header text-center max-w-3xl mx-auto mb-16">
          <span className="section-label">Our Services</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-6">
            Services for Tech Companies
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Focused on what IT and MSP businesses actually need to thrive financially.
          </p>
        </div>

        {/* Grid */}
        <div className="services-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="service-card-gsap service-card group"
            >
              <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors duration-300">
                <service.icon className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy-900 mb-2">
                {service.title}
              </h3>
              <p className="text-navy-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
