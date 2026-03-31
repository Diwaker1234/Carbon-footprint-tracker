"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Sparkles,
  Zap,
  Car,
  Utensils,
  Trash2,
  ShoppingBag,
  Droplets,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: "#22c55e",
  ENERGY: "#3b82f6",
  FOOD: "#f59e0b",
  WASTE: "#ef4444",
  SHOPPING: "#10b981",
  WATER: "#8b5cf6"
};

interface Activity {
  id: string;
  category: string;
  subcategory: string;
  raw_value: number;
  carbon_equivalent: number;
  date: string;
}

export default function AnalyticsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/activities");
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('activity-logged', fetchData);
    return () => window.removeEventListener('activity-logged', fetchData);
  }, []);

  // Aggregations
  const totalKg = activities.reduce((sum, a) => sum + (a.carbon_equivalent || 0), 0);
  const avgIntensity = activities.length > 0 ? (totalKg / activities.length).toFixed(2) : "0.00";

  // Category Breakdown
  const catSummary = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.carbon_equivalent;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(catSummary).map(([name, value]) => ({
    name,
    value: +value.toFixed(2),
    color: CATEGORY_COLORS[name] || "#ccc"
  })).sort((a, b) => b.value - a.value);

  // Time-Series (Last 30 Days)
  const timeDataMap = new Map();
  const last30Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    timeDataMap.set(dayStr, { date: dayStr, total: 0 });
    return dayStr;
  });

  activities.forEach(a => {
    const dayStr = new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (timeDataMap.has(dayStr)) {
      const record = timeDataMap.get(dayStr);
      record.total += a.carbon_equivalent;
    }
  });

  const chartData = Array.from(timeDataMap.values());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair tracking-tight">Analytics Engine</h1>
          <p className="text-muted text-sm mt-1">Multi-dimensional telemetry for your Carbon ERP.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">14-Day Trajectory</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-widest bg-success/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Live Forecast
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff" }}
                />
                <Area type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
           <div>
             <h3 className="text-lg font-bold mb-1">Impact Stats</h3>
             <p className="text-xs text-muted uppercase tracking-widest font-bold mb-8">Environmental P&L</p>
             
             <div className="space-y-6">
                <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-tighter">Total Intensity</p>
                    <p className="text-3xl font-bold text-foreground">{totalKg.toFixed(1)} <span className="text-sm font-normal text-muted">kg CO2e</span></p>
                </div>
                <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-tighter">Avg per Activity</p>
                    <p className="text-3xl font-bold text-foreground">{avgIntensity} <span className="text-sm font-normal text-muted">kg</span></p>
                </div>
             </div>
           </div>
           
           <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                <Sparkles className="w-3 h-3" />
                NEURAL INSIGHT
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Your average footprint per login is {avgIntensity}kg. Reduction by 5% will meet your annual budget.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-8">Category Intensity Map</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#0f172a] text-white p-10 rounded-[32px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:scale-150 group-hover:rotate-45">
                <BarChart3 className="w-64 h-64" />
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-playfair font-bold mb-4 italic">Executive Summary</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                    Aether-Carbon has verified {activities.length} ledger entries. Your reduction efficiency is currently at 92%. Focus on Energy optimization to reach your 2,000kg annual budget streak.
                </p>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Status</span>
                        <span className="text-sm font-bold">On-target</span>
                    </div>
                    <div className="flex flex-col ml-8">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Budget left</span>
                        <span className="text-sm font-bold">{(2000 - totalKg).toFixed(1)} kg</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
