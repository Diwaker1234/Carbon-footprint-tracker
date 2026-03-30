"use client";

import React, { useState, useMemo } from "react";
import { 
  Car, 
  Zap, 
  Utensils, 
  Trash2, 
  ShoppingBag, 
  Droplets,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Info,
  CheckCircle2,
  X,
  Loader2
} from "lucide-react";
import { Category, EMISSION_FACTORS, calculateEmission } from "@/lib/carbon-engine";
import { saveActivity } from "@/app/actions/activity";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "TRANSPORT", label: "Transport", icon: <Car />, color: "bg-primary" },
  { id: "ENERGY", label: "Energy", icon: <Zap />, color: "bg-blue-500" },
  { id: "FOOD", label: "Food", icon: <Utensils />, color: "bg-orange-500" },
  { id: "WASTE", label: "Waste", icon: <Trash2 />, color: "bg-red-500" },
  { id: "SHOPPING", label: "Shopping", icon: <ShoppingBag />, color: "bg-teal-500" },
  { id: "WATER", label: "Water", icon: <Droplets />, color: "bg-secondary" },
];

interface ActivityLoggerProps {
  onClose: () => void;
}

const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<string>("");
  const [value, setValue] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedCategoryFactors = useMemo(() => {
    return category ? EMISSION_FACTORS[category] : [];
  }, [category]);

  const calculation = useMemo(() => {
    if (!category || !subcategory || value <= 0) return null;
    try {
      return calculateEmission(category, subcategory, value);
    } catch {
      return null;
    }
  }, [category, subcategory, value]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSave = async () => {
    if (!category || !subcategory || value <= 0) return;
    setIsSaving(true);
    try {
      await saveActivity({ category, subcategory, value, date, note });
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Log Activity</h2>
          <p className="text-xs text-muted">Step {step} of 4</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex h-1 w-full bg-gray-100 dark:bg-slate-800">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "25%" }}
          animate={{ width: `${step * 25}%` }}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <AnimatePresence mode="wait">
          {saveSuccess ? (
             <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center h-full space-y-4"
             >
               <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold">Activity Saved!</h3>
               <p className="text-muted text-sm">Your carbon footprint has been updated.</p>
             </motion.div>
          ) : step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); handleNext(); }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
                    category === cat.id ? "border-primary bg-primary/5" : "border-gray-100 dark:border-slate-800 hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${cat.color} text-white shadow-lg`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </button>
              ))}
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Select Type</h3>
              {selectedCategoryFactors.map((f) => (
                <button
                  key={f.subcategory}
                  onClick={() => { setSubcategory(f.subcategory); handleNext(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    subcategory === f.subcategory ? "border-primary bg-primary/5" : "border-gray-100 dark:border-slate-800 hover:border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground capitalize">
                    {f.subcategory.replace(/_/g, " ")}
                  </span>
                  {subcategory === f.subcategory && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </motion.div>
          ) : step === 3 ? (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-muted mb-2 uppercase tracking-wider">Quantity</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value || ""}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-2xl font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-medium">
                    {selectedCategoryFactors.find(f => f.subcategory === subcategory)?.unit || ""}
                  </div>
                </div>
              </div>

              {calculation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 text-primary font-medium mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Live Calculation</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {calculation.carbon_kg} <span className="text-lg font-normal text-muted">kg CO₂e</span>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Source: {calculation.source} (±{calculation.uncertainty_range.high - calculation.carbon_kg}kg)
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : step === 4 ? (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-muted mb-2 uppercase tracking-wider">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 pl-12 text-foreground font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2 uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-foreground outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                  placeholder="Tell us more about this activity..."
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/30">
        {!saveSuccess && step > 1 ? (
          <button 
            onClick={handleBack}
            disabled={isSaving}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : <div />}

        {!saveSuccess && step < 4 ? (
          <button 
            onClick={handleNext}
            disabled={step === 1 && !category || step === 2 && !subcategory || step === 3 && value <= 0 || isSaving}
            className="bg-primary text-white px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : !saveSuccess ? (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Activity"}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ActivityLogger;
