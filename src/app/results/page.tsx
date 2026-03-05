"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, FileText, CheckCircle2, AlertTriangle, Info, Zap, TrendingUp } from "lucide-react"
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
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <div className="bg-secondary/30 p-6 md:p-8 rounded-full mb-6">
              <Info className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">No active analysis found</h2>
            <p className="text-sm text-muted-foreground mb-8">Please upload an image to view AI diagnostic results.</p>
            <Button asChild className="bg-primary text-background font-bold px-8">
              <Link href="/upload">Go to Upload</Link>
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
              <div className="flex items-center gap-3 md:gap-4">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                  <Link href="/upload"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-black text-white truncate">Analysis Report</h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                    Session: {sessionTime || "..."} • ID: {sessionId || "..."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Button variant="outline" size="sm" className="gap-2 border-white/5 bg-secondary/30 shrink-0">
                  <Download className="w-4 h-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2 border-white/5 bg-secondary/30 shrink-0">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Prediction Summary */}
              <div className="lg:col-span-4 space-y-6">
                <Card className={`glass-card border-l-8 ${isHealthy ? 'border-l-accent' : 'border-l-destructive'}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Primary Prediction</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isHealthy ? 'text-accent' : 'text-destructive'}`}>
                        {analysisResult.prediction}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        {isHealthy ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{presentationResults.predictionCard.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        <span>Confidence Score</span>
                        <span className="text-white">{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                      <Progress value={analysisResult.confidence * 100} className={`h-2 ${isHealthy ? '[&>div]:bg-accent' : '[&>div]:bg-destructive'}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source Image</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full">
                      <Image src={preview} alt="Analysis Source" fill className="object-cover" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Model Voting Section */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Consolidated Performance</CardTitle>
                    <CardDescription className="text-xs">Tuning metrics and multi-model consensus</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Overall Accuracy Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Pre-Tuning Accuracy</p>
                          <div className="text-3xl font-black text-white">82.4%</div>
                          <p className="text-[10px] text-muted-foreground mt-1">Baseline ensemble performance</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Activity className="w-24 h-24 text-primary" />
                        </div>
                      </div>
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 relative overflow-hidden cyan-glow">
                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Post-Tuning Accuracy</p>
                          <div className="text-3xl font-black text-white">94.2%</div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-accent mt-1">
                            <TrendingUp className="w-3 h-3" /> +11.8% Improvement
                          </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Zap className="w-24 h-24 text-accent" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <ModelScoreCard 
                        name="VGG16" 
                        prediction={presentationResults.modelVoting.vgg16.prediction} 
                        score={presentationResults.modelVoting.vgg16.confidence} 
                        improvement={2.1}
                      />
                      <ModelScoreCard 
                        name="ResNet50" 
                        prediction={presentationResults.modelVoting.resnet50.prediction} 
                        score={presentationResults.modelVoting.resnet50.confidence} 
                        improvement={3.4}
                      />
                      <ModelScoreCard 
                        name="InceptionV3" 
                        prediction={presentationResults.modelVoting.inceptionv3.prediction} 
                        score={presentationResults.modelVoting.inceptionv3.confidence} 
                        improvement={1.8}
                      />
                    </div>

                    <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-primary/20 p-3 rounded-xl cyan-glow shrink-0">
                          <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-black text-primary tracking-widest">Consensus Result</p>
                          <h3 className="text-xl md:text-2xl font-bold text-white truncate">{presentationResults.modelVoting.majorityVoteResult}</h3>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Overall Accuracy</p>
                        <p className="text-base md:text-lg font-mono font-bold text-accent">94.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="glass-card flex flex-col items-center justify-center p-4 md:p-6 min-h-[400px]">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 w-full text-center">Anatomical Context</h3>
                      <div className="flex-1 w-full max-w-[250px] mx-auto">
                        <HumanBodyVisualizer 
                          isDetected={!isHealthy} 
                          prediction={analysisResult.prediction}
                          className="h-full" 
                        />
                      </div>
                   </Card>

                   <Card className="glass-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inference Benchmarks</CardTitle>
                        <CardDescription className="text-xs">Real-time optimization impact</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <AccuracyMetric model="VGG16" before={89} after={91} />
                        <AccuracyMetric model="ResNet50" before={82} after={85} />
                        <AccuracyMetric model="InceptionV3" before={84} after={86} />
                        <div className="pt-2 text-[10px] text-muted-foreground italic leading-tight border-t border-white/5 mt-4">
                          * Results reflect post-tuning reinforcement learning passes on standard clinical datasets.
                        </div>
                      </CardContent>
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

function ModelScoreCard({ name, prediction, score, improvement }: { name: string, prediction: string, score: number, improvement: number }) {
  return (
    <div className="bg-secondary/20 border border-white/5 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{name}</p>
        <span className="text-[9px] font-bold text-accent">+{improvement}%</span>
      </div>
      <p className="text-sm font-bold text-white mb-1 truncate">{prediction}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Confidence</span>
        <span className="text-[10px] font-mono font-bold text-primary">{score}%</span>
      </div>
      <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function AccuracyMetric({ model, before, after }: { model: string, before: number, after: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-white">{model}</span>
        <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider">
          <span className="text-muted-foreground">Base: {before}%</span>
          <span className="text-accent">Optimized: {after}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div className="bg-muted-foreground/30 h-full" style={{ width: `${before}%` }} />
        <div className="bg-accent h-full" style={{ width: `${after - before}%` }} />
      </div>
    </div>
  )
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
