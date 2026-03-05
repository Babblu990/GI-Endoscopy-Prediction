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
  
  // Mapping conditions to anatomical regions
  const isEsophagus = normalizedPrediction.includes('esophagitis') || 
                      normalizedPrediction.includes('infection');
                    
  const isStomach = normalizedPrediction.includes('ulcer');

  const isLowerGI = normalizedPrediction.includes('polyp') || 
                    normalizedPrediction.includes('tumor');

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center p-4", className)}>
      <svg
        viewBox="0 0 240 600"
        className="w-full h-full max-h-[550px] drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* High-Fidelity Human Silhouette */}
        <g className="text-muted-foreground/30">
          <path
            d="M120 20C100 20 85 35 85 55C85 75 100 90 120 90C140 90 155 75 155 55C155 35 140 20 120 20Z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="M85 95C70 100 55 110 45 130C35 150 30 200 35 250C40 300 55 320 65 310C75 300 80 250 80 200L80 560C80 580 95 580 105 580L115 400L125 400L135 580C145 580 160 580 160 560L160 200C160 250 165 300 175 310C185 320 200 300 205 250C210 200 205 150 195 130C185 110 170 100 155 95H85Z"
            fill="url(#bodyGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>

        {/* Internal Anatomical System (GI Tract) */}
        <g className="transition-all duration-1000">
          
          {/* Esophagus (Upper GI) */}
          <path
            d="M120 95V210"
            className={cn(
              "stroke-white/10 fill-none transition-all duration-700",
              isDetected && isEsophagus ? "stroke-accent stroke-[8px] opacity-100" : "stroke-[4px] opacity-30"
            )}
            strokeLinecap="round"
            filter={isDetected && isEsophagus ? "url(#glow)" : ""}
          />

          {/* Stomach (Mid GI) */}
          <path
            d="M120 210C120 210 102 215 97 240C92 265 112 285 132 285C152 285 167 265 162 235C157 210 142 210 127 210"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isStomach ? "stroke-accent fill-accent/25 stroke-[5px] opacity-100" : "stroke-[2px] opacity-20"
            )}
            filter={isDetected && isStomach ? "url(#glow)" : ""}
          />

          {/* Large Intestine (Lower GI Frame) */}
          <path
            d="M85 300H155V390H85V300"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent fill-accent/20 stroke-[5px] opacity-100" : "stroke-[2px] opacity-20"
            )}
            strokeLinejoin="round"
            filter={isDetected && isLowerGI ? "url(#glow)" : ""}
          />

          {/* Small Intestine Complex */}
          <path
            d="M100 315C100 315 110 310 120 310C130 310 140 315 140 315C140 315 145 325 145 340C145 355 130 370 120 370C110 370 95 355 95 340C95 325 100 315 100 315Z"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent/70 fill-accent/15 stroke-[3px] opacity-100" : "stroke-[1.5px] opacity-15"
            )}
          />

          {/* Dynamic Detection Overlays */}
          {isDetected && (
            <g>
              {isEsophagus && (
                <g className="animate-pulse">
                  <circle cx="120" cy="150" r="25" fill="url(#organGlow)" />
                  <path d="M120 130V170" stroke="hsl(var(--accent))" strokeWidth="3" strokeDasharray="6 3" className="animate-[dash_1.5s_linear_infinite]" />
                </g>
              )}
              {isStomach && (
                <g className="animate-pulse">
                  <circle cx="125" cy="245" r="35" fill="url(#organGlow)" />
                  <circle cx="125" cy="245" r="10" className="fill-accent animate-ping" />
                </g>
              )}
              {isLowerGI && (
                <g className="animate-pulse">
                  <circle cx="120" cy="345" r="40" fill="url(#organGlow)" />
                  <rect x="110" y="335" width="20" height="20" className="stroke-accent fill-accent/30 animate-bounce" strokeWidth="2" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* Live Scanning Line Animation */}
        <line
          x1="20" y1="0" x2="220" y2="0"
          className="stroke-primary/50 stroke-[2px] animate-[scan_3s_ease-in-out_infinite]"
          filter="url(#glow)"
        />

        <style jsx>{`
          @keyframes dash {
            to { stroke-dashoffset: -24; }
          }
          @keyframes scan {
            0% { transform: translateY(80px); opacity: 0; }
            50% { opacity: 0.9; }
            100% { transform: translateY(520px); opacity: 0; }
          }
        `}</style>
      </svg>
      
      {/* Live Monitoring HUD */}
      {isDetected && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 w-full max-w-[220px]">
          <div className="bg-background/80 backdrop-blur-2xl text-accent border border-accent/50 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_40px_rgba(56,163,117,0.3)] text-center w-full">
            {isEsophagus ? "Esophageal Detection" : isStomach ? "Gastric Detection" : isLowerGI ? "Colorectal Detection" : "Anomaly Mapped"}
          </div>
          <div className="h-6 w-px bg-accent/60 my-2" />
          <p className="text-[11px] text-white font-black uppercase tracking-widest text-center drop-shadow-md">
            {prediction}
          </p>
        </div>
      )}

      {/* Static Anatomical Labels */}
      <div className="absolute top-1/4 left-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] vertical-text select-none">
        Internal Monitoring
      </div>
      <div className="absolute bottom-1/4 right-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] vertical-text select-none">
        Diagnostic Zone
      </div>
    </div>
  );
}
