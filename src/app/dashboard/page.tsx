"use client";

import React, { useState } from "react";
import { 
  Utensils, 
  Trash2, 
  ShoppingBag, 
  TrendingDown, 
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  Flame,
  Star,
  Info,
  Lightbulb,
  Zap,
  Car,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from "recharts";

const CATEGORY_DATA = [
  { name: "Transport", value: 45, color: "#22c55e" },
  { name: "Energy", value: 25, color: "#3b82f6" },
  { name: "Food", value: 20, color: "#f59e0b" },
  { name: "Waste", value: 5, color: "#ef4444" },
  { name: "Shopping", value: 5, color: "#10b981" },
];

const WEEKLY_DATA = [
  { day: "Mon", transport: 8.2, energy: 4.1, food: 3.5 },
  { day: "Tue", transport: 6.5, energy: 4.3, food: 3.2 },
  { day: "Wed", transport: 9.1, energy: 4.0, food: 3.8 },
  { day: "Thu", transport: 7.8, energy: 4.2, food: 3.4 },
  { day: "Fri", transport: 5.4, energy: 4.5, food: 4.0 },
  { day: "Sat", transport: 12.5, energy: 3.8, food: 5.2 },
  { day: "Sun", transport: 2.1, energy: 3.5, food: 4.8 },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: "Transport", desc: "Commute to Office", sub: "Car (Petrol)", value: "5.25 kg", time: "2h ago", icon: <Car /> },
  { id: 2, type: "Food", desc: "Lunch", sub: "Beef Burger", value: "2.70 kg", time: "5h ago", icon: <Utensils /> },
  { id: 3, type: "Energy", desc: "Daily Electricity", sub: "Grid Average", value: "8.40 kg", time: "1d ago", icon: <Zap /> },
];

export default function DashboardPage() {
  const [dynamicInsight, setDynamicInsight] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityData: WEEKLY_DATA }),
        });
        const data = await res.json();
        if (data.insight) setDynamicInsight(data.insight);
      } catch (err) {
        console.error("Failed to load AI insight", err);
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Pranjal! 👋</h1>
          <p className="text-muted text-sm mt-1">Here's your carbon impact summary for March 2024.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <button className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-md">Today</button>
          <button className="px-4 py-2 text-xs font-semibold text-muted hover:text-foreground">Weekly</button>
          <button className="px-4 py-2 text-xs font-semibold text-muted hover:text-foreground">Monthly</button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Metric */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-success text-xs font-bold bg-success/10 px-2 py-1 rounded-lg">
              <ArrowDownRight className="w-3 h-3" />
              8.3%
            </div>
          </div>
          <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total CO₂e (MT)</h3>
          <p className="text-3xl font-bold text-foreground">4.21</p>
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium">
            <span className="text-muted">Target: 3.80 MT</span>
            <span className="text-primary">+12% vs Goal</span>
          </div>
        </div>

        {/* Global Progress */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Reduction Goal</h3>
          <p className="text-3xl font-bold text-foreground">62%</p>
          <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 w-[62%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        {/* Gamification Streak */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Logging Streak</h3>
          <p className="text-3xl font-bold text-foreground">12 Days</p>
          <p className="text-xs text-muted mt-4">Next badge: 15-Day Warrior</p>
        </div>

        {/* Points Summary */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Green Points</h3>
          <p className="text-3xl font-bold text-foreground">1,250</p>
          <p className="text-xs text-muted mt-4">Rank: #14 in your City</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-foreground">Weekly Emission Trend</h3>
              <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest">March 11 - March 17</p>
            </div>
            <button className="p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all">
              <Calendar className="w-5 h-5 text-muted" />
            </button>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#94a3b8" }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#94a3b8" }} 
                />
                <Tooltip 
                  cursor={{ fill: "rgba(34, 197, 94, 0.05)" }} 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    padding: "16px"
                  }} 
                />
                <Bar dataKey="transport" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={40} />
                <Bar dataKey="energy" stackId="a" fill="#3b82f6" />
                <Bar dataKey="food" stackId="a" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
          <div className="w-full mb-10">
            <h3 className="text-lg font-bold text-foreground">Category Breakdown</h3>
            <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest">By Proportion</p>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">4.2</span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Tons Total</span>
            </div>
          </div>
          <div className="w-full mt-10 space-y-4">
            {CATEGORY_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-muted">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
            <button className="text-primary text-xs font-bold font-mono tracking-widest hover:underline uppercase">View All</button>
          </div>
          <div className="space-y-6">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-gray-100 dark:border-slate-600">
                    {React.cloneElement(act.icon as React.ReactElement, { className: "w-5 h-5 text-primary" })}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{act.desc}</h4>
                    <p className="text-[11px] text-muted font-medium mt-0.5">{act.sub} · {act.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{act.value}</p>
                  <p className="text-[10px] text-success font-bold uppercase mt-0.5">Verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-primary p-10 rounded-[32px] shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/10 transition-transform duration-700 group-hover:scale-150">
            <Lightbulb className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white mb-8">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Insights</h3>
            <p className="text-white/80 text-sm font-medium mb-10 max-w-sm">
              {dynamicInsight ? (
                <span>{dynamicInsight}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce delay-150" />
                  Analyzing patterns...
                </span>
              )}
            </p>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center gap-4 border border-white/10 cursor-pointer hover:bg-white/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">Transport patterns are 40% above avg</span>
                <ArrowUpRight className="w-4 h-4 text-white/50 ml-auto" />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center gap-4 border border-white/10 cursor-pointer hover:bg-white/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-green-400 flex items-center justify-center text-primary-dark">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">New 'Food Master' badge unlocked!</span>
                <ArrowUpRight className="w-4 h-4 text-white/50 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
