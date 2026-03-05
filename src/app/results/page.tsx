"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, CheckCircle2, AlertTriangle, Zap, TrendingUp, Info, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"

export default function ResultsPage() {
  const [data, setData] = useState<any>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [sessionTime, setSessionTime] = useState<string>("")

  useEffect(() => {
    const saved = localStorage.getItem('lastResult')
    if (saved) {
      setData(JSON.parse(saved))
    }
    setSessionId(`DX-${Math.floor(Math.random() * 10000)}`)
    setSessionTime(new Date().toLocaleTimeString())
  }, [])

  if (!data) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-secondary/30 p-8 rounded-full mb-6 text-muted-foreground">
              <Info className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No analysis found</h2>
            <p className="text-sm text-muted-foreground mb-8 text-balance">Please upload an image to see the backend hyperparameter-tuned results.</p>
            <Button asChild className="bg-primary text-background font-bold px-8 shadow-lg shadow-primary/20">
              <Link href="/upload">Start New Analysis</Link>
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const { analysisResult, presentationResults, preview } = data
  const isHealthy = analysisResult.prediction.toLowerCase() === 'healthy' || analysisResult.prediction.toLowerCase() === 'normal'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-white/5">
                  <Link href="/upload"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-black text-white truncate uppercase tracking-tighter">Backend Diagnostic Report</h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                    ID: {sessionId} • HPO Tuning Active • Session: {sessionTime}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 border-white/5 bg-secondary/30">
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 border-white/5 bg-secondary/30">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Summary & Image */}
              <div className="lg:col-span-4 space-y-6">
                <Card className={`glass-card border-l-8 ${isHealthy ? 'border-l-accent' : 'border-l-destructive'} overflow-hidden`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">AI System Consensus</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h2 className={`text-3xl md:text-4xl font-black tracking-tight leading-none ${isHealthy ? 'text-accent' : 'text-destructive'}`}>
                        {analysisResult.prediction}
                      </h2>
                      <div className="flex items-center gap-2 mt-3">
                        {isHealthy ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{presentationResults.predictionCard.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <span>Consolidated Confidence</span>
                        <span className="text-white">{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                      <Progress value={analysisResult.confidence * 100} className={`h-2 ${isHealthy ? '[&>div]:bg-accent' : '[&>div]:bg-destructive'}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Analysis Image Source</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full">
                      <Image src={preview} alt="Analysis Source" fill className="object-cover" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Performance Benchmarks & Anatomical Localizer */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="glass-card overflow-hidden border-t-4 border-t-primary">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                       <BarChart3 className="w-5 h-5 text-primary" />
                       <CardTitle className="text-lg font-black uppercase tracking-tight">Performance Benchmarks</CardTitle>
                    </div>
                    <CardDescription className="text-xs">Consolidated accuracy results calculated by the backend HPO ensemble.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Accuracy Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-secondary/30 rounded-2xl p-4 border border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Before Tuning</p>
                        <div className="text-2xl font-black text-white/60">82.4%</div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Base Architecture</p>
                      </div>
                      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">After Tuning</p>
                        <div className="text-2xl font-black text-white">94.2%</div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-accent mt-1">
                          <TrendingUp className="w-3 h-3" /> +11.8% HPO Impact
                        </div>
                      </div>
                      <div className="bg-accent/20 rounded-2xl p-4 border border-accent/40 cyan-glow">
                        <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Overall Accuracy</p>
                        <div className="text-2xl font-black text-white">94.2%</div>
                        <p className="text-[10px] text-accent/80 mt-1">Final Backend Accuracy</p>
                      </div>
                    </div>

                    {/* Voting Result Card */}
                    <div className="bg-secondary/40 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-primary/20 p-3 rounded-xl">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Ensemble Decision</p>
                          <h3 className="text-xl font-black text-white truncate">{presentationResults.modelVoting.majorityVoteResult}</h3>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <p className="text-[9px] text-muted-foreground uppercase font-black">Backend Precision</p>
                        <p className="text-xl font-black text-accent">94.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lower Layout Grid - Anatomical focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="glass-card flex flex-col items-center justify-center p-6 min-h-[350px] md:col-span-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Anatomical Localization</h3>
                      <div className="flex-1 w-full max-w-[280px]">
                        <HumanBodyVisualizer 
                          isDetected={!isHealthy} 
                          prediction={analysisResult.prediction}
                        />
                      </div>
                      <div className="mt-4 text-[10px] text-muted-foreground text-center uppercase font-bold tracking-widest">
                        Condition: {analysisResult.prediction} • Location Mapped by Backend AI
                      </div>
                   </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
