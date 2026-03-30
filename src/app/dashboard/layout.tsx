"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  PlusCircle, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Trophy, 
  BarChart3, 
  Settings,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronRight,
  LogOut,
  Leaf
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ActivityLogger from "@/components/ActivityLogger";
import AIChatbot from "@/components/AIChatbot";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard />, href: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: <TrendingUp />, href: "/dashboard/analytics" },
  { id: "insights", label: "Insights", icon: <Lightbulb />, href: "/dashboard/insights" },
  { id: "goals", label: "Goals", icon: <Target />, href: "/dashboard/goals" },
  { id: "challenges", label: "Challenges", icon: <Trophy />, href: "/dashboard/challenges" },
  { id: "reports", label: "Reports", icon: <BarChart3 />, href: "/dashboard/reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`flex min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-500`}>
      {/* Sidebar */}
      <aside className={`fixed h-screen z-40 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 transition-all duration-500 ${isSidebarOpen ? "w-72" : "w-24"}`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Leaf className="w-6 h-6" />
            </div>
            {isSidebarOpen && <span className="font-playfair text-xl font-bold text-foreground">CarbonTrack</span>}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setIsLoggerOpen(true)}
              className="w-full flex items-center gap-3 bg-primary text-white p-4 rounded-2xl font-medium shadow-md hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98] mb-8"
            >
              <PlusCircle className="w-5 h-5" />
              {isSidebarOpen && <span>Log Activity</span>}
            </button>

            {MENU_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.id} href={item.href}>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    active ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-foreground"
                  }`}>
                    {React.cloneElement(item.icon as React.ReactElement, { className: `w-5 h-5` })}
                    {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                    {active && isSidebarOpen && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer Navigation */}
          <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-700">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-muted hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-foreground transition-all">
              <Settings className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? "ml-72" : "ml-24"}`}>
        {/* Topbar */}
        <header className="h-20 px-10 flex items-center justify-between sticky top-0 z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${isSidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="bg-gray-50 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-11 pr-4 w-64 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-slate-700">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-slate-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>
            <div className="h-10 w-[1px] bg-gray-100 dark:border-slate-700 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Pranjal Sharma</p>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Carbon Champion</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center font-bold text-primary">
                PS
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10">
          {children}
        </div>
      </main>

      {/* Activity Logger Modal */}
      <AnimatePresence>
        {isLoggerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <ActivityLogger onClose={() => setIsLoggerOpen(false)} />
          </div>
        )}
      </AnimatePresence>
      <AIChatbot />
    </div>
  );
}
