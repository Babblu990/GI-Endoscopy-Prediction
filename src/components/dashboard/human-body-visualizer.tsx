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
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Realistic Human Silhouette */}
        <g className="text-muted-foreground/30">
          <path
            d="M120 20C100 20 85 35 85 55C85 75 100 90 120 90C140 90 155 75 155 55C155 35 140 20 120 20Z"
            fill="currentColor"
            opacity="0.2"
          />
          <path
            d="M85 95C70 100 55 110 45 130C35 150 30 200 35 250C40 300 55 320 65 310C75 300 80 250 80 200L80 560C80 580 95 580 105 580L115 400L125 400L135 580C145 580 160 580 160 560L160 200C160 250 165 300 175 310C185 320 200 300 205 250C210 200 205 150 195 130C185 110 170 100 155 95H85Z"
            fill="url(#bodyGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </g>

        {/* Enhanced GI Tract Internal Model */}
        <g className="transition-all duration-1000">
          
          {/* Esophagus Path (Upper GI) */}
          <path
            d="M118 95V210"
            className={cn(
              "stroke-white/10 fill-none transition-all duration-700",
              isDetected && isEsophagus ? "stroke-accent stroke-[8px] opacity-100" : "stroke-[4px] opacity-30"
            )}
            strokeLinecap="round"
            filter={isDetected && isEsophagus ? "url(#glow)" : ""}
          />

          {/* Stomach Detailed Path (Mid GI) */}
          <path
            d="M118 210C118 210 100 215 95 240C90 265 110 285 130 285C150 285 165 265 160 235C155 210 140 210 125 210"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isStomach ? "stroke-accent fill-accent/20 stroke-[4px] opacity-100" : "stroke-[1.5px] opacity-20"
            )}
            filter={isDetected && isStomach ? "url(#glow)" : ""}
          />

          {/* Colon / Large Intestine Frame (Lower GI) */}
          <path
            d="M90 300H150V380H90V300"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent fill-accent/15 stroke-[4px] opacity-100" : "stroke-[1.5px] opacity-20"
            )}
            strokeLinejoin="round"
            filter={isDetected && isLowerGI ? "url(#glow)" : ""}
          />

          {/* Small Intestine Intricate Core */}
          <path
            d="M105 320C105 320 115 315 125 315C135 315 145 320 145 320C145 320 150 330 150 345C150 360 135 375 125 375C115 375 100 360 100 345C100 330 105 320 105 320Z"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent/60 fill-accent/10 stroke-[2px] opacity-100" : "stroke-[1px] opacity-15"
            )}
          />

          {/* Dynamic Highlight Overlays & Pulse Effects */}
          {isDetected && (
            <g>
              {isEsophagus && (
                <g className="animate-pulse">
                  <circle cx="118" cy="150" r="20" fill="url(#organGlow)" />
                  <path d="M118 130V170" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="4 2" className="animate-[dash_2s_linear_infinite]" />
                </g>
              )}
              {isStomach && (
                <g className="animate-pulse">
                  <circle cx="125" cy="245" r="30" fill="url(#organGlow)" />
                  <circle cx="125" cy="245" r="8" className="fill-accent animate-ping" />
                </g>
              )}
              {isLowerGI && (
                <g className="animate-pulse">
                  <circle cx="120" cy="340" r="35" fill="url(#organGlow)" />
                  <rect x="110" y="330" width="20" height="20" className="stroke-accent fill-accent/20 animate-bounce" strokeWidth="1" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* Live Scanning Effect Line */}
        <line
          x1="30" y1="0" x2="210" y2="0"
          className="stroke-primary/40 stroke-[1px] animate-[scan_4s_ease-in-out_infinite]"
        />

        <style jsx>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          @keyframes scan {
            0% { transform: translateY(50px); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(550px); opacity: 0; }
          }
        `}</style>
      </svg>
      
      {/* HUD Information Overlay */}
      {isDetected && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 w-full max-w-[200px]">
          <div className="bg-accent/10 backdrop-blur-xl text-accent border border-accent/40 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-700 shadow-[0_0_30px_rgba(56,163,117,0.2)] text-center w-full">
            {isEsophagus ? "Esophageal Detection" : isStomach ? "Gastric Detection" : isLowerGI ? "Colorectal Detection" : "Anomaly Mapped"}
          </div>
          <div className="h-4 w-px bg-accent/40 my-2" />
          <p className="text-[10px] text-white font-bold uppercase tracking-widest text-center">
            {prediction}
          </p>
        </div>
      )}

      {/* Body Regions Labels (Static) */}
      <div className="absolute top-1/4 right-0 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest vertical-text select-none">
        Thoracic Region
      </div>
      <div className="absolute top-1/2 right-0 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest vertical-text select-none">
        Abdominal Cavity
      </div>
    </div>
  );
}
