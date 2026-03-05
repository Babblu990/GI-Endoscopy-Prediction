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
        className="w-full h-full max-h-[550px] drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
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
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Realistic Medical Silhouette */}
        <g className="transition-all duration-1000">
          {/* Head & Neck */}
          <path
            d="M120 10C90 10 75 35 75 65C75 95 90 115 120 115C150 115 165 95 165 65C165 35 150 10 120 10Z"
            fill="url(#bodyGradient)"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />
          {/* Torso & Limbs */}
          <path
            d="M80 120C55 125 35 145 25 180C15 220 10 280 15 350C20 420 40 460 55 450C70 440 75 380 75 300L75 570C75 590 90 595 105 595L115 420L125 420L135 595C150 595 165 590 165 570L165 300C165 380 170 440 185 450C200 460 220 420 225 350C230 280 225 220 215 180C205 145 185 125 160 120H80Z"
            fill="url(#bodyGradient)"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />
        </g>

        {/* Detailed Anatomical GI Tract */}
        <g className="transition-all duration-1000">
          {/* Esophagus (Upper GI) */}
          <path
            d="M120 120V230"
            className={cn(
              "stroke-white/10 fill-none transition-all duration-700",
              isDetected && isEsophagus ? "stroke-accent stroke-[12px] opacity-100" : "stroke-[5px] opacity-20"
            )}
            strokeLinecap="round"
            filter={isDetected && isEsophagus ? "url(#glow)" : ""}
          />

          {/* Stomach (Gastric) */}
          <path
            d="M120 230C120 230 90 235 85 270C80 305 115 325 140 325C165 325 180 305 175 265C170 235 145 230 127 230"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isStomach ? "stroke-accent fill-accent/40 stroke-[8px] opacity-100" : "stroke-[3px] opacity-15"
            )}
            filter={isDetected && isStomach ? "url(#glow)" : ""}
          />

          {/* Intestinal Region (Lower GI) */}
          <path
            d="M85 335H155V430H85V335"
            className={cn(
              "stroke-white/10 fill-white/5 transition-all duration-700",
              isDetected && isLowerGI ? "stroke-accent fill-accent/30 stroke-[8px] opacity-100" : "stroke-[3px] opacity-15"
            )}
            strokeLinejoin="round"
            filter={isDetected && isLowerGI ? "url(#glow)" : ""}
          />

          {/* Dynamic Detection HUD Overlays */}
          {isDetected && (
            <g className="animate-pulse">
              {isEsophagus && <circle cx="120" cy="175" r="35" fill="url(#organGlow)" />}
              {isStomach && <circle cx="125" cy="275" r="45" fill="url(#organGlow)" />}
              {isLowerGI && <circle cx="120" cy="385" r="50" fill="url(#organGlow)" />}
            </g>
          )}
        </g>

        {/* Live HUD Scanline Animation */}
        <line
          x1="10" y1="0" x2="230" y2="0"
          className="stroke-primary/80 stroke-[3px] animate-[scan_4s_linear_infinite]"
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
      
      {/* Live Region HUD Detail */}
      {isDetected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center pointer-events-none z-10">
          <div className="bg-black/90 backdrop-blur-3xl text-accent border border-accent/40 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_0_60px_rgba(56,163,117,0.5)] text-center animate-in fade-in zoom-in duration-700">
            <span className="text-white/60 text-[9px] mb-2 block">Detection Focal Point</span>
            {isEsophagus ? "Upper GI Target" : isStomach ? "Gastric Target" : "Lower GI Target"}
            <div className="h-px w-full bg-accent/30 my-3" />
            <span className="text-white text-[13px] tracking-widest">{prediction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
