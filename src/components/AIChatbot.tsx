"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Carbon AI. How can I help you reduce your footprint today?" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userMsg = inputVal.trim();
    setInputVal("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const apiMessages = [...messages, { role: "user", content: userMsg }].map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops, something went wrong connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-primary-dark transition-all hover:scale-110 z-50 group border-4 border-white dark:border-slate-900"
      >
        <MessageCircle className="w-6 h-6 animate-pulse group-hover:animate-none" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Carbon AI</h3>
                  <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Powered by Groq</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm ${m.role === "user" ? "bg-slate-800 dark:bg-slate-700" : "bg-primary"}`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 text-sm font-medium shadow-sm ${
                      m.role === "user" 
                        ? "bg-slate-800 text-white rounded-[20px] rounded-tr-sm dark:bg-slate-700 font-medium" 
                        : "bg-white text-slate-700 rounded-[20px] rounded-tl-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white bg-primary shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce delay-75" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 z-10">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-gray-50 dark:bg-slate-800 text-sm font-medium border-none outline-none rounded-full py-3.5 pl-5 pr-12 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !inputVal.trim()}
                  className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
