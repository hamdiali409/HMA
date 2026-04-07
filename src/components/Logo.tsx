import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 bg-teal-400 rounded-full p-1 shadow-md border-2 border-white group-hover:rotate-12 transition-transform duration-500">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="font-black text-2xl text-slate-900 leading-none tracking-tighter group-hover:text-blue-600 transition-colors">HMA</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-1">Homa Academy</span>
        </div>
      )}
    </div>
  );
}
