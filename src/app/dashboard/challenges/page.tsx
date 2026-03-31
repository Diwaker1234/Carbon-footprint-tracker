"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Award, 
  CheckCircle2, 
  TrendingDown, 
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  category: string;
  icon: React.ReactNode;
}

const MOCK_CHALLENGES: Challenge[] = [
  { 
    id: "1", 
    title: "14-Day Meatless Streak", 
    description: "Switch to plant-based meals for 14 days straight.", 
    points: 500, 
    progress: 65, 
    category: "FOOD",
    icon: <Target className="w-5 h-5 text-orange-500" />
  },
  { 
    id: "2", 
    title: "Eco-Commute Week", 
    description: "Use public transit or cycling for all commutes this week.", 
    points: 300, 
    progress: 40, 
    category: "TRANSPORT",
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  { 
    id: "3", 
    title: "Zero-Waste Warrior", 
    description: "Log less than 1kg of landfill waste for 7 days.", 
    points: 250, 
    progress: 90, 
    category: "WASTE",
    icon: <Trophy className="w-5 h-5 text-red-500" />
  }
];

export default function ChallengesPage() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Fetch point tally from profile
    const fetchPoints = async () => {
        const res = await fetch("/api/activities");
        if (res.ok) {
            const data = await res.json();
            setPoints(data.length * 15); // Simple calculation for MVP
        }
    };
    fetchPoints();
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair tracking-tight">Personal Challenges</h1>
          <p className="text-muted text-sm mt-1">Gamified behavioral engineering for self-optimization.</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl px-10 py-4 rounded-[24px] border border-gray-100 dark:border-slate-700 shadow-xl flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
             <Trophy className="w-6 h-6" />
           </div>
           <div>
             <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-0.5">Green Points Balance</span>
             <span className="text-2xl font-bold text-foreground font-mono">{points} PTS</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-4">Active Mitigation Streaks</h3>
          <div className="space-y-4">
            {MOCK_CHALLENGES.map((challenge) => (
              <div key={challenge.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-8 text-primary/5 transition-transform group-hover:scale-150 rotate-12">
                   <Flame className="w-32 h-32" />
                </div>
                
                <div className="flex items-start justify-between relative z-10 mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                        {challenge.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{challenge.title}</h4>
                        <p className="text-xs text-muted max-w-sm">{challenge.description}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-xs font-bold text-primary block">+{challenge.points} PTS</span>
                      <span className="text-xs text-muted">Reward Pool</span>
                   </div>
                </div>

                <div className="relative z-10 space-y-3">
                   <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted tracking-widest">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-4">Neural Milestones</h3>
          
          <div className="bg-[#0f172a] text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light backdrop-blur-xl border border-white/10">
                 <Award className="w-7 h-7" />
               </div>
               
               <div className="space-y-2">
                 <h4 className="text-xl font-bold font-playfair italic">Carbon ERP Verified</h4>
                 <p className="text-white/60 text-xs leading-relaxed">
                   Complete 10 precise Ledger entries using AI OCR to unlock the "Sustainability Auditor" badge.
                 </p>
               </div>

               <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                 View Badge Ledger
                 <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h4 className="text-sm font-bold uppercase tracking-widest">Streak Intelligence</h4>
             </div>
             <p className="text-xs text-muted leading-relaxed mb-6">
               Your "Zero-Waste Warrior" streak is at 90%. Maintaining this for 24 more hours will reduce your annual budget debt by 50kg.
             </p>
             <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <TrendingDown className="w-4 h-4" />
                Deeper savings imminent.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
