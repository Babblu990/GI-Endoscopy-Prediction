"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface HumanBodyVisualizerProps {
  isDetected?: boolean;
  prediction?: string;
  className?: string;
}

export function HumanBodyVisualizer({ isDetected, prediction, className }: HumanBodyVisualizerProps) {
  const isInfection = prediction?.toLowerCase().includes('infection');
  const isLowerGI = prediction?.toLowerCase().includes('polyp') || 
                    prediction?.toLowerCase().includes('ulcer') || 
                    prediction?.toLowerCase().includes('tumor');

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center p-8", className)}>
      <svg
        viewBox="0 0 200 500"
        className="w-full h-full max-h-[500px] drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified Human Silhouette */}
        <path
          d="M100 20C85 20 75 35 75 50C75 65 85 80 100 80C115 80 125 65 125 50C125 35 115 20 100 20Z"
          className="fill-muted-foreground/20"
        />
        <path
          d="M75 85L50 120L40 220L50 240L60 200L70 150L70 450L95 450L95 280L105 280L105 450L130 450L130 150L140 200L150 240L160 220L150 120L125 85H75Z"
          className="fill-muted-foreground/10 stroke-muted-foreground/20"
          strokeWidth="2"
        />

        {/* GI Tract Highlight Regions */}
        <g>
          {/* Esophagus/Upper GI area - Active on Infection */}
          <path
            d="M95 120C95 120 85 140 85 160C85 180 100 190 115 180C130 170 120 140 120 140"
            className={cn(
              "stroke-primary/20 transition-all duration-700", 
              isDetected && isInfection ? "stroke-accent fill-accent/20 opacity-100" : "opacity-40"
            )}
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Intestinal/Lower GI area - Active on Polyp/Ulcer/Tumor */}
          <path
            d="M85 190C85 190 70 210 85 230C100 250 120 230 135 250C150 270 130 290 130 290"
            className={cn(
              "stroke-primary/20 transition-all duration-700", 
              isDetected && (isLowerGI || !isInfection) ? "stroke-accent fill-accent/20 opacity-100" : "opacity-40"
            )}
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Pulse effect if detected */}
          {isDetected && (
            <circle 
              cx="100" 
              cy={isInfection ? "140" : "240"} 
              r="30" 
              className="fill-accent/30 animate-ping" 
            />
          )}
        </g>
      </svg>
      
      {isDetected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="bg-accent/20 text-accent border border-accent/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(56,163,117,0.4)]">
            {isInfection ? "Upper GI Anomaly" : "Lower GI Anomaly"}
          </div>
        </div>
      )}
    </div>
  );
}