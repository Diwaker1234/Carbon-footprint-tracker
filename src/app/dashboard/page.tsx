"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Utensils, 
  Trash2, 
  ShoppingBag, 
  TrendingDown, 
  ArrowDownRight, 
  Flame, 
  Star, 
  Info,
  Zap, 
  Car, 
  Target,
  Loader2, 
  CheckCircle2, 
  Camera, 
  Plus, 
  Trash, 
  Check, 
  Brain, 
  History, 
  Activity as ActivityIcon
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
  Pie
} from "recharts";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { parseReceiptOCR } from "@/lib/ocr-engine";
import { saveActivity } from "@/app/actions/activity";
import ManualEntryModal from "@/components/ManualEntryModal";

const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: "#22c55e",
  ENERGY: "#3b82f6",
  FOOD: "#f59e0b",
  WASTE: "#ef4444",
  SHOPPING: "#10b981",
  WATER: "#8b5cf6"
};

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  TRANSPORT: <Car />,
  ENERGY: <Zap />,
  FOOD: <Utensils />,
  WASTE: <Trash2 />,
  SHOPPING: <ShoppingBag />,
  WATER: <Info />
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface Activity {
  id: string;
  category: string;
  subcategory: string;
  raw_value: number;
  carbon_equivalent: number;
  date: string;
  createdAt: string;
}

interface DraftItem {
  id: string;
  category: string;
  subcategory: string;
  value: number;
  unit: string;
  carbon_equivalent: number;
  insight_hint?: string;
  isProcessing?: boolean;
}

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('activity-logged', fetchData);
    return () => window.removeEventListener('activity-logged', fetchData);
  }, []);

  // AI-First: Handle Receipt Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await parseReceiptOCR(base64);
        
        if (result && result.activities) {
          const newDrafts = result.activities.map((item: {
            category: string;
            subcategory: string;
            value: number;
            unit: string;
            carbon_equivalent: number;
            insight_hint?: string;
          }, idx: number) => ({
            id: `draft-${Date.now()}-${idx}`,
            category: item.category,
            subcategory: item.subcategory,
            value: item.value,
            unit: item.unit,
            carbon_equivalent: item.carbon_equivalent,
            insight_hint: item.insight_hint
          }));
          setDrafts(prev => [...prev, ...newDrafts]);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("AI Scan Error:", err);
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleManualSave = async (data: {
    category: any;
    subcategory: string;
    value: number;
    unit: string;
    facility: string;
    date: string;
    source: string;
  }) => {
    try {
      const res = await saveActivity(data);
      if (res.success) {
        await fetchData();
        window.dispatchEvent(new CustomEvent('activity-logged'));
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const confirmDraft = async (draft: DraftItem) => {

    try {
      const res = await saveActivity({
        category: draft.category as any,
        subcategory: draft.subcategory,
        value: draft.value,
        unit: draft.unit,
        date: new Date().toISOString(),
        source: "OCR"
      });

      if (res.success) {
        setDrafts(prev => prev.filter(d => d.id !== draft.id));
        await fetchData();
        // Trigger global event for real-time sync
        window.dispatchEvent(new CustomEvent('activity-logged'));
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  // Aether-Carbon: Compute Aggregations
  const totalCarbon = activities.reduce((sum, a) => sum + (a.carbon_equivalent || 0), 0) / 1000; // MT

  const categoryTotals = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + (a.carbon_equivalent || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalKg = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    color: CATEGORY_COLORS[name] || "#ccc",
    value: Math.round((value / totalKg) * 100)
  })).sort((a, b) => b.value - a.value);

  const activeCategoryData = categoryData.length > 0 ? categoryData : [{ name: "No Data", value: 100, color: "#e2e8f0" }];

  const weeklyDataMap = new Map();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    weeklyDataMap.set(dayName, { 
      day: dayName, 
      transport: 0, energy: 0, food: 0, waste: 0, shopping: 0, water: 0 
    });
  }

  activities.forEach(a => {
    const d = new Date(a.date);
    const timeDiff = today.getTime() - d.getTime();
    if (timeDiff <= 7 * 24 * 60 * 60 * 1000 && timeDiff >= 0) {
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const record = weeklyDataMap.get(dayName);
      if (record) {
        const catKey = a.category.toLowerCase();
        record[catKey] = (record[catKey] || 0) + (a.carbon_equivalent || 0);
      }
    }
  });

  const weeklyData = Array.from(weeklyDataMap.values());



  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* AI HERO INTAKE SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-[#0f172a] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group border border-slate-800"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-5 py-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/60 font-medium">Neural Logic Core v2.0</span>
                    </div>
                    <h2 className="text-4xl font-playfair font-bold italic leading-tight">Fastest Data Intake.</h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                        Our AI Neural Core scans receipts, logistics data, and utility bills to automatically append to your Ledger.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            {isScanning ? "AI Processing..." : "Scan Receipt (AI Vision)"}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        <button 
                            onClick={() => setIsManualModalOpen(true)}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            Manual Entry
                        </button>
                    </div>
                </div>
                <div className="w-64 h-64 relative hidden md:block">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full" 
                    />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 backdrop-blur-xl flex items-center justify-center border border-white/5 shadow-inner">
                        <Brain className="w-16 h-16 text-primary animate-pulse-slow" />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Neural Draft List */}
        <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 dark:border-slate-700/50 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ActivityIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Neural Draft Feed</h3>
                </div>
                <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold">{drafts.length} Pending</span>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {drafts.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-3xl">
                            <History className="w-8 h-8 text-muted/30 mb-3" />
                            <p className="text-[11px] text-muted leading-relaxed font-medium">Your scan results will appear here for verification.</p>
                        </motion.div>
                    )}
                    {drafts.map((draft) => (
                        <motion.div 
                            key={draft.id} 
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-gray-100 dark:border-slate-600 shadow-sm group hover:border-primary/50 transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter">AI Scanned</span>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => confirmDraft(draft)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success hover:text-white transition-all"><Check className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => removeDraft(draft.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-primary">
                                    {React.cloneElement(CATEGORY_ICONS[draft.category] || <Info />, { className: "w-4 h-4" })}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground capitalize">{draft.subcategory.replace(/_/g, " ")}</p>
                                    <p className="text-[10px] text-muted font-medium">{draft.value} {draft.unit} = <span className="text-primary font-bold">{draft.carbon_equivalent}kg</span></p>
                                    {draft.insight_hint && <p className="text-[9px] text-blue-500 font-medium italic mt-1">✨ {draft.insight_hint}</p>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
      </section>

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        onSave={handleManualSave} 
      />

      {/* Main Analytics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-right">
                <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Impact Velocity</p>
                <div className="flex items-center gap-1 text-success font-bold text-xs">
                    <ArrowDownRight className="w-3 h-3" />
                    12.5%
                </div>
            </div>
          </div>
          <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Total Verified CO₂e</h3>
          <p className="text-3xl font-bold text-foreground">{totalCarbon.toFixed(3)} <span className="text-lg text-muted font-normal">MT</span></p>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-transform group-hover:scale-110">
                    <Target className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Ledger Points</h3>
            <p className="text-3xl font-bold text-foreground">{activities.length}</p>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 transition-transform group-hover:scale-110">
                    <Flame className="w-6 h-6 animate-pulse" />
                </div>
            </div>
            <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Neural Streak</h3>
            <p className="text-3xl font-bold text-foreground">{activities.length > 0 ? '1' : '0'} Days</p>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Star className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Green Points</h3>
            <p className="text-3xl font-bold text-foreground font-mono">{activities.length * 15}</p>
        </div>
      </motion.div>

      {/* Main Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm relative hover:shadow-lg transition-shadow duration-500">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-foreground">Live 7-Day Trend</h3>
              <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest">Aether Analytics Core</p>
            </div>
          </div>
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: "#94a3b8" }} />
                <Tooltip 
                  cursor={{ fill: "rgba(34, 197, 94, 0.1)" }} 
                  contentStyle={{ borderRadius: "16px", border: "none", backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#fff" }} 
                />
                <Bar dataKey="transport" stackId="a" fill={CATEGORY_COLORS.TRANSPORT} radius={[4, 4, 0, 0]} barSize={45} />
                <Bar dataKey="energy" stackId="a" fill={CATEGORY_COLORS.ENERGY} />
                <Bar dataKey="food" stackId="a" fill={CATEGORY_COLORS.FOOD} />
                <Bar dataKey="shopping" stackId="a" fill={CATEGORY_COLORS.SHOPPING} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm flex flex-col items-center relative transition-shadow duration-500 hover:shadow-lg">
          <div className="w-full mb-10 relative z-10">
            <h3 className="text-lg font-bold text-foreground">Distribution</h3>
            <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest">Impact footprint</p>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeCategoryData} innerRadius={80} outerRadius={105} paddingAngle={10} dataKey="value" stroke="none">
                  {activeCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold font-playfair bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent">
                {categoryData.length > 0 ? categoryData[0].value : 0}%
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                {categoryData.length > 0 ? categoryData[0].name : "No Data"}
              </span>
            </div>
          </div>
          <div className="w-full mt-10 space-y-4 relative z-10">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-muted">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cloud Ledger */}
      <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 rounded-[32px] border border-white/40 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Global Cloud Ledger</h3>
            </div>
            <button className="text-xs text-primary font-bold hover:underline">View All Entries</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.length === 0 && (
                <div className="col-span-2 text-center p-12 text-muted border-2 border-dashed border-gray-100 rounded-3xl font-medium">Your Aether-Carbon Ledger is currently empty. Start by high-speed scanning your first receipt.</div>
            )}
            {activities.slice(0, 6).map((act) => (
                <div key={act.id} className="flex items-center justify-between bg-white/40 dark:bg-slate-700/40 p-5 rounded-2xl border border-gray-100 dark:border-slate-600 transition-all hover:translate-x-1 hover:border-primary/20">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-primary">
                            {React.cloneElement(CATEGORY_ICONS[act.category] || <CheckCircle2 />, { className: "w-5 h-5" })}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground capitalize">{act.subcategory.replace(/_/g, " ")}</h4>
                            <p className="text-[10px] text-muted font-medium mt-0.5 uppercase tracking-widest">{new Date(act.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-foreground font-mono">{act.carbon_equivalent.toFixed(2)} <span className="text-xs text-muted">kg</span></p>
                        <p className="text-[9px] bg-success/10 text-success px-2 py-0.5 rounded-full inline-block font-bold uppercase mt-1">Verified</p>
                    </div>
                </div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
