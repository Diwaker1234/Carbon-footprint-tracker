"use client";

import React, { useState, useEffect } from "react";
import { 
  Leaf, 
  TrendingDown, 
  Award, 
  ShieldCheck,
  Globe,
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import HeroCanvas from "@/components/HeroCanvas";
import AmbientGlow from "@/components/AmbientGlow";
import { useScramble } from "@/hooks/useScramble";
import { motion } from "framer-motion";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const title1 = useScramble("Know Your", 1000, 300);
  const title2 = useScramble("Impact", 1200, 500);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen font-inter selection:bg-primary/20 selection:text-foreground">
      <AmbientGlow />

      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 px-8 py-4 transition-all duration-500 ease-out ${
          scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <Leaf className="w-6 h-6 text-primary animate-bounce-slow" />
            <span className="font-playfair text-xl font-semibold tracking-tight text-foreground">CarbonTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#features" className="text-sm font-medium text-muted hover:text-foreground transition-colors">How it Works</a>
            <button className="text-sm font-medium text-muted hover:text-foreground transition-colors">Sign In</button>
            <button 
              className="relative overflow-hidden group bg-primary text-white px-7 py-2.5 rounded-full font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-400 hover:scale-[1.04] active:scale-[0.97] btn-shimmer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />

        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-full px-5 py-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted font-medium">AI-Powered Carbon Tracking</span>
          </motion.div>

          <h1 className="font-playfair text-6xl md:text-8xl lg:text-[10rem] font-semibold text-foreground leading-[0.9] tracking-tight mb-8">
            <span>{title1}</span> <br />
            <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent animate-gradient-shift">
              {title2}
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed font-light"
          >
            Measure, monitor, and reduce your CO₂e emissions in real-time. Personalized AI insights for a sustainable future.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <button 
              className="relative overflow-hidden group bg-primary text-white px-10 py-4 rounded-full font-medium text-base tracking-wide shadow-md hover:shadow-lg transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] btn-shimmer"
            >
              Start Tracking
            </button>
            <button className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-muted hover:text-foreground px-10 py-4 rounded-full font-medium text-base shadow-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
              View Demo
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-indicator flex flex-col items-center">
            <div className="w-[1px] h-14 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span className="font-mono text-[10px] tracking-[0.4em] text-muted mt-3">SCROLL</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-background z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="font-mono text-xs tracking-[0.3em] text-primary uppercase font-medium">Features</span>
                <h2 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mt-4 leading-tight tracking-tight">Everything You Need<br />to Live Greener</h2>
                <p className="text-muted text-lg mt-6 max-w-lg mx-auto font-light leading-relaxed">AI-driven tools built to make sustainability a daily habit, not a yearly guilt trip.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: <Globe />, title: "Interactive Emission Network", desc: "Visualize your footprint as a 3D network. Watch nodes shrink as you adopt sustainable habits.", color: "bg-primary/10", iconColor: "text-primary" },
                  { icon: <Sparkles />, title: "AI-Powered Insights", desc: "Personalized recommendations based on your specific data patterns, not just generic tips.", color: "bg-blue-500/10", iconColor: "text-blue-500" },
                  { icon: <TrendingDown />, title: "Predictive Analytics", desc: "At your current rate, your annual footprint will be X. See exactly how one change impacts your future.", color: "bg-teal-500/10", iconColor: "text-teal-500" },
                  { icon: <Award />, title: "Gamified Challenges", desc: "Points, badges, and streaks to keep you motivated. Join community challenges to scale impact.", color: "bg-red-500/10", iconColor: "text-red-500" },
                  { icon: <LayoutDashboard />, title: "Continuous Tracking", desc: "Connect smart meters or use manual logs. Real-time feedback loop: Track → Analyze → Act.", color: "bg-orange-500/10", iconColor: "text-orange-500" },
                  { icon: <ShieldCheck />, title: "Region-Aware Accuracy", desc: "Uses local emission factors (US vs EU vs India grids) for the most accurate calculation possible.", color: "bg-secondary/10", iconColor: "text-secondary" },
                ].map((feature, i) => (
                  <div key={i} className="spotlight-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-500 hover:-translate-y-1">
                    <div className="spotlight-content">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                        {React.cloneElement(feature.icon as React.ReactElement, { className: `w-6 h-6 ${feature.iconColor}` })}
                      </div>
                      <h3 className="text-foreground font-medium text-lg mb-3 tracking-tight">{feature.title}</h3>
                      <p className="text-muted text-sm leading-relaxed font-light">{feature.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 px-8 bg-background relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-muted">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-light tracking-wide">CarbonTrack · © 2024</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["About", "Features", "Pricing", "Privacy", "GitHub"].map((link) => (
              <a key={link} href="#" className="text-muted hover:text-foreground text-sm transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
