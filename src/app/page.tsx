"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Leaf } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Direct redirect to the AI-First Dashboard
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-pulse">
        <Leaf className="w-8 h-8" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-white font-playfair text-2xl font-bold tracking-tight">Initializing Aether-Carbon</h1>
        <div className="flex items-center gap-2 text-primary/60 font-mono text-[10px] tracking-widest uppercase">
          <Loader2 className="w-3 h-3 animate-spin" />
          Neural Core Loading...
        </div>
      </div>
    </div>
  );
}

