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
        </defs>

        {/* Realistic Human Silhouette */}
        <path
          d="M120 20C100 20 85 35 85 55C85 75 100 90 120 90C140 90 155 75 155 55C155 35 140 20 120 20Z"
          className="fill-muted-foreground/20"
        />
        <path
          d="M85 95C70 100 55 110 45 130C35 150 30 200 35 250C40 300 55 320 65 310C75 300 80 250 80 200L80 560C80 580 95 580 105 580L115 400L125 400L135 580C145 580 160 580 160 560L160 200C160 250 165 300 175 310C185 320 200 300 205 250C210 200 205 150 195 130C185 110 170 100 155 95H85Z"
          fill="url(#bodyGradient)"
          className="text-muted-foreground stroke-muted-foreground/20"
          strokeWidth="1.5"
        />

        {/* GI Tract Details */}
        <g className="transition-all duration-700">
          
          {/* Esophagus (Upper GI) */}
          <path
            d="M116 95L116 210C116 210 118 220 125 220C132 220 134 210 134 210L134 95"
            className={cn(
              "stroke-white/5 fill-transparent transition-all duration-500",
              isDetected && isEsophagus ? "stroke-accent fill-accent/20 stroke-[6px]" : "stroke-[4px]"
            )}
            strokeLinecap="round"
          />

          {/* Stomach (Mid GI) */}
          <path
            d="M125 220C110 220 95 230 90 255C85 280 105 300 125 300C145 300 160 280 155 250C150 220 140 220 125 220Z"
            className={cn(
              "stroke-white/5 fill-white/5 transition-all duration-500",
              isDetected && isStomach ? "stroke-accent fill-accent/30 stroke-[3px]" : "stroke-[1.5px]"
            )}
          />

          {/* Large Intestine (Lower GI Frame) */}
          <path
            d="M95 310H145V380H95V310Z"
            className={cn(
              "stroke-white/5 fill-white/5 transition-all duration-500 rounded-lg",
              isDetected && isLowerGI ? "stroke-accent fill-accent/20 stroke-[3px]" : "stroke-[1.5px]"
            )}
            strokeLinejoin="round"
          />

          {/* Small Intestine (Core Central) */}
          <path
            d="M105 325C105 325 110 320 120 320C130 320 135 325 135 325C135 325 140 330 140 340C140 350 130 360 120 360C110 360 100 350 100 340C100 330 105 325 105 325Z"
            className={cn(
              "stroke-white/5 fill-white/5 transition-all duration-500",
              isDetected && isLowerGI ? "stroke-accent/50 fill-accent/10 stroke-[2px]" : "stroke-[1px]"
            )}
          />

          {/* Dynamic Highlight Overlays */}
          {isDetected && (
            <g>
              {isEsophagus && (
                <>
                  <circle cx="125" cy="150" r="25" fill="url(#organGlow)" className="animate-pulse" />
                  <path d="M125 130L125 170" stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="4 2" className="animate-[dash_2s_linear_infinite]" />
                </>
              )}
              {isStomach && (
                <>
                  <circle cx="122" cy="260" r="35" fill="url(#organGlow)" className="animate-pulse" />
                  <circle cx="122" cy="260" r="10" className="fill-accent animate-ping" />
                </>
              )}
              {isLowerGI && (
                <>
                  <circle cx="120" cy="345" r="40" fill="url(#organGlow)" className="animate-pulse" />
                  <rect x="105" y="330" width="30" height="30" className="stroke-accent fill-accent/20 animate-bounce" strokeWidth="1" />
                </>
              )}
            </g>
          )}
        </g>

        <style jsx>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
        `}</style>
      </svg>
      
      {isDetected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 flex flex-col items-center pointer-events-none z-10">
          <div className="bg-accent/10 backdrop-blur-md text-accent border border-accent/40 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in duration-500 shadow-[0_0_25px_rgba(56,163,117,0.3)]">
            {isEsophagus ? "Upper GI Focus" : isStomach ? "Gastric Focus" : isLowerGI ? "Lower GI Focus" : "Region Detected"}
          </div>
          <p className="text-[8px] text-white/40 mt-2 font-bold uppercase tracking-widest">
            {prediction} Localization
          </p>
        </div>
      )}
    </div>
  );
}
