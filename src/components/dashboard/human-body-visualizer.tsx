
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface HumanBodyVisualizerProps {
  isDetected?: boolean;
  prediction?: string;
  className?: string;
}

export function HumanBodyVisualizer({ isDetected, prediction, className }: HumanBodyVisualizerProps) {
  const normalizedPrediction = prediction?.toLowerCase() || '';
  
  const isEsophagus = normalizedPrediction.includes('esophagitis') || 
                      normalizedPrediction.includes('infection');
                    
  const isStomach = normalizedPrediction.includes('ulcer');

  const isLowerGI = normalizedPrediction.includes('polyp') || 
                    normalizedPrediction.includes('tumor');

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center p-4", className)}>
      <svg
        viewBox="0 0 240 600"
        className="w-full h-full max-h-[550px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
            <stop offset="50%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g className="transition-all duration-1000">
          <path
            d="M120 10C90 10 75 35 75 65C75 95 90 115 120 115C150 115 165 95 165 65C165 35 150 10 120 10Z"
            fill="url(#bodyGradient)"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />
          <path
            d="M80 120C55 125 35 145 25 180C15 220 10 280 15 350C20 420 40 460 55 450C70 440 75 380 75 300L75 570C75 590 90 595 105 595L115 420L125 420L135 595C150 595 165 590 165 570L165 300C165 380 170 440 185 450C200 460 220 420 225 350C230 280 225 220 215 180C205 145 185 125 160 120H80Z"
            fill="url(#bodyGradient)"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />
        </g>

        <g className="transition-all duration-1000">
          <path
            d="M120 120V230"
            className={cn(
              "stroke-white/10 fill-none transition-all duration-700",
              isDetected && isEsophagus ? "stroke-accent stroke-[10px] opacity-100" : "stroke-[3px] opacity-20"
            )}
            strokeLinecap="round"
            filter={isDetected && isEsophagus ? "url(#glow)" : ""}
          />

          <path
            d="M120 230C120 230 90 235 85 270C80 305 115 325 140 325C165 325 180 305 175 265C170 235 145 230 127 230"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isStomach ? "stroke-accent fill-accent/40 stroke-[6px] opacity-100" : "stroke-[2px] opacity-15"
            )}
            filter={isDetected && isStomach ? "url(#glow)" : ""}
          />

          <path
            d="M85 335H155V430H85V335"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent fill-accent/30 stroke-[6px] opacity-100" : "stroke-[2px] opacity-15"
            )}
            strokeLinejoin="round"
            filter={isDetected && isLowerGI ? "url(#glow)" : ""}
          />

          {isDetected && (
            <g className="animate-pulse">
              {isEsophagus && <circle cx="120" cy="175" r="30" fill="url(#organGlow)" />}
              {isStomach && <circle cx="125" cy="275" r="40" fill="url(#organGlow)" />}
              {isLowerGI && <circle cx="120" cy="385" r="45" fill="url(#organGlow)" />}
            </g>
          )}
        </g>

        <line
          x1="0" y1="0" x2="240" y2="0"
          className="stroke-primary/60 stroke-[2px] animate-[scan_4s_linear_infinite]"
          filter="url(#glow)"
        />

        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(50px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(550px); opacity: 0; }
          }
        `}</style>
      </svg>
      
      {/* Modern Clinical HUD Diagnostic Interface */}
      {isDetected && (
        <div className="absolute top-[30%] -right-8 flex items-start gap-4 pointer-events-none animate-in fade-in slide-in-from-right duration-700">
           <div className="w-16 h-px bg-accent/50 mt-4 relative">
             <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full border border-accent bg-accent/20 animate-ping" />
           </div>
           <div className="glass-card border-accent/30 p-4 rounded-2xl min-w-[180px] shadow-[0_0_40px_-10px_rgba(var(--accent),0.2)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Active Finding</span>
              </div>
              <p className="text-white text-sm font-black uppercase tracking-tight leading-none mb-1">{prediction}</p>
              <div className="h-px w-full bg-white/5 my-2" />
              <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Sector</span>
                <span className="text-accent/80">
                   {isEsophagus ? "Upper GI" : isStomach ? "Gastric" : "Lower GI"}
                </span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
