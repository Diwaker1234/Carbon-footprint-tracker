import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Zap, Droplets, Trash2, ShoppingBag, X, Loader2, Car, Building2 } from 'lucide-react';
import { Category } from '@/lib/carbon-engine';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    category: Category;
    subcategory: string;
    value: number;
    unit: string;
    facility: string;
    date: string;
    source: string;
  }) => Promise<void>;
}

const TABS = [
  { id: Category.ENERGY, label: 'Energy', icon: <Zap className="w-4 h-4" /> },
  { id: Category.TRANSPORT, label: 'Transport', icon: <Car className="w-4 h-4" /> },
  { id: Category.WATER, label: 'Water', icon: <Droplets className="w-4 h-4" /> },
  { id: Category.WASTE, label: 'Waste', icon: <Trash2 className="w-4 h-4" /> },
  { id: Category.FOOD, label: 'Food', icon: <Leaf className="w-4 h-4" /> },
  { id: Category.SHOPPING, label: 'Shopping', icon: <ShoppingBag className="w-4 h-4" /> },
];

const FACILITIES = [
  "Residential Areas",
  "Hostels",
  "Academic Area",
  "Health Centre",
  "Schools",
  "Visitor's Hostel",
  "Servant's Quarters",
  "Shops/Bank/PO",
  "Lawns and Horticulture",
  "Dhobhighat",
  "Others"
];

// Subcategories mapping
const SUB_CATEOGRIES = {
  [Category.ENERGY]: [
    { value: 'electricity', label: 'Electricity (Grid)', unit: 'kWh' },
    { value: 'natural_gas', label: 'Natural Gas', unit: 'm3' },
    { value: 'heating_oil', label: 'Heating Oil', unit: 'L' },
    { value: 'diesel_generator', label: 'Diesel Generator', unit: 'L' },
  ],
  [Category.TRANSPORT]: [
    { value: 'car_petrol', label: 'Car (Petrol)', unit: 'km' },
    { value: 'car_diesel', label: 'Car (Diesel)', unit: 'km' },
    { value: 'car_electric', label: 'Car (EV)', unit: 'km' },
    { value: 'bus', label: 'Bus', unit: 'km' },
    { value: 'train', label: 'Train', unit: 'km' },
    { value: 'flight_short', label: 'Flight (Short)', unit: 'km' },
    { value: 'flight_long', label: 'Flight (Long)', unit: 'km' },
  ],
  [Category.WATER]: [
    { value: 'tap_water', label: 'Tap Water', unit: 'Liters' },
    { value: 'bottled_water', label: 'Bottled Water', unit: 'Liters' },
  ],
  [Category.WASTE]: [
    { value: 'landfill', label: 'Landfill Waste', unit: 'kg' },
    { value: 'recycling', label: 'Recycling', unit: 'kg' },
    { value: 'compost', label: 'Compost', unit: 'kg' },
  ],
  [Category.FOOD]: [
    { value: 'beef', label: 'Beef', unit: 'kg' },
    { value: 'chicken', label: 'Chicken', unit: 'kg' },
    { value: 'fish', label: 'Fish', unit: 'kg' },
    { value: 'vegan_meal', label: 'Vegan Meal', unit: 'meals' },
    { value: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'meals' },
    { value: 'meat_meal', label: 'Meat Meal', unit: 'meals' },
  ],
  [Category.SHOPPING]: [
    { value: 'clothing', label: 'Clothing', unit: 'items' },
    { value: 'electronics', label: 'Electronics', unit: 'items' },
  ],
};

export default function ManualEntryModal({ isOpen, onClose, onSave }: ManualEntryModalProps) {
  const [activeTab, setActiveTab] = useState<Category>(Category.ENERGY);
  const [facility, setFacility] = useState(FACILITIES[2]);
  const [subcategory, setSubcategory] = useState(SUB_CATEOGRIES[Category.ENERGY][0].value);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle active tab change to reset subcategory
  const handleTabChange = (tab: Category) => {
    setActiveTab(tab);
    setSubcategory(SUB_CATEOGRIES[tab][0].value);
  };

  const getActiveUnit = () => {
    const list = SUB_CATEOGRIES[activeTab];
    const item = list.find((i) => i.value === subcategory);
    return item?.unit || 'unit';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(Number(value))) return;
    setIsSubmitting(true);
    try {
      await onSave({
        category: activeTab,
        subcategory,
        value: Number(value),
        unit: getActiveUnit(),
        facility,
        date: new Date(date).toISOString(),
        source: 'MANUAL',
      });
      onClose();
      // Reset form
      setValue('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between bg-slate-800/20">
            <div>
              <h2 className="text-xl font-playfair font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Ledger Entry Form
              </h2>
              <p className="text-[11px] text-white/50 uppercase tracking-widest mt-1 font-medium">Aether-Carbon Manual Bridge</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="p-6 space-y-8">
              
              {/* Tabs */}
              <div className="flex overflow-x-auto pb-2 custom-scrollbar gap-2 hide-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/30 p-6 rounded-2xl border border-white/5">
                
                {/* Facility Row */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Facility / Location <span className="text-red-400">*</span></label>
                  <select 
                    value={facility} 
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                  >
                    {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Subcategory Row (Dynamic based on tab) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">{activeTab} Source <span className="text-red-400">*</span></label>
                  <select 
                    value={subcategory} 
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                  >
                    {SUB_CATEOGRIES[activeTab].map(sc => (
                      <option key={sc.value} value={sc.value}>{sc.label}</option>
                    ))}
                  </select>
                </div>

                {/* Value Row */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Amount Consumed <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      required
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-white/40 text-sm font-medium">{getActiveUnit()}</span>
                    </div>
                  </div>
                </div>

                {/* Date Row */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Date <span className="text-red-400">*</span></label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || !value}
                className="px-8 py-2.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Syncing...' : 'Add to Ledger'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
