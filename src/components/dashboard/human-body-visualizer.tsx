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
        className="w-full h-full max-h-[550px] drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.03" />
            <stop offset="50%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0.03" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Realistic High-Fidelity Silhouette */}
        <g className="text-white/20">
          <path
            d="M120 15C95 15 80 35 80 60C80 85 95 105 120 105C145 105 160 85 160 60C160 35 145 15 120 15Z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M80 110C60 115 40 130 30 160C20 190 15 250 20 310C25 370 45 400 55 390C65 380 70 320 70 260L70 565C70 585 85 585 95 585L110 400L130 400L145 585C155 585 170 585 170 565L170 260C170 320 175 380 185 390C195 400 215 370 220 310C225 250 220 190 210 160C200 130 180 115 160 110H80Z"
            fill="url(#bodyGradient)"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.4"
          />
        </g>

        {/* Live GI tract Anatomy */}
        <g className="transition-all duration-1000">
          {/* Esophagus */}
          <path
            d="M120 110V210"
            className={cn(
              "stroke-white/10 fill-none transition-all duration-700",
              isDetected && isEsophagus ? "stroke-accent stroke-[10px] opacity-100" : "stroke-[4px] opacity-20"
            )}
            strokeLinecap="round"
            filter={isDetected && isEsophagus ? "url(#glow)" : ""}
          />

          {/* Stomach */}
          <path
            d="M120 210C120 210 95 215 90 245C85 275 110 295 135 295C160 295 175 275 170 240C165 210 145 210 127 210"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isStomach ? "stroke-accent fill-accent/30 stroke-[6px] opacity-100" : "stroke-[2.5px] opacity-15"
            )}
            filter={isDetected && isStomach ? "url(#glow)" : ""}
          />

          {/* Intestinal Region */}
          <path
            d="M85 305H155V400H85V305"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent fill-accent/25 stroke-[6px] opacity-100" : "stroke-[2.5px] opacity-15"
            )}
            strokeLinejoin="round"
            filter={isDetected && isLowerGI ? "url(#glow)" : ""}
          />

          {/* Dynamic HUD Overlays */}
          {isDetected && (
            <g className="animate-pulse">
              {isEsophagus && <circle cx="120" cy="160" r="30" fill="url(#organGlow)" />}
              {isStomach && <circle cx="125" cy="250" r="40" fill="url(#organGlow)" />}
              {isLowerGI && <circle cx="120" cy="350" r="45" fill="url(#organGlow)" />}
            </g>
          )}
        </g>

        {/* Live Scanning Animation */}
        <line
          x1="10" y1="0" x2="230" y2="0"
          className="stroke-primary/60 stroke-[2.5px] animate-[scan_3.5s_ease-in-out_infinite]"
          filter="url(#glow)"
        />

        <style jsx>{`
          @keyframes scan {
            0% { transform: translateY(100px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(530px); opacity: 0; }
          }
        `}</style>
      </svg>
      
      {/* Live Region HUD Overlay */}
      {isDetected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center pointer-events-none z-10">
          <div className="bg-background/90 backdrop-blur-3xl text-accent border border-accent/40 px-6 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(56,163,117,0.4)] text-center animate-in fade-in zoom-in duration-500">
            {isEsophagus ? "Upper GI Target" : isStomach ? "Gastric Target" : "Lower GI Target"}
            <div className="h-px w-full bg-accent/20 my-2" />
            <span className="text-white text-[12px]">{prediction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
