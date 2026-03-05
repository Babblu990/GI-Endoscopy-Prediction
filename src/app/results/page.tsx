"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, FileText, CheckCircle2, AlertTriangle, Info, Zap } from "lucide-react"
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
    // Defer dynamic values to after mount to avoid hydration mismatch
    setSessionId(`DX-${Math.floor(Math.random() * 10000)}`)
    setSessionTime(new Date().toLocaleTimeString())
  }, [])

  if (!data) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-secondary/30 p-8 rounded-full mb-6">
              <Info className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No active analysis found</h2>
            <p className="text-muted-foreground mb-8">Please upload an image to view AI diagnostic results.</p>
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
        <main className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/upload"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-white">Analysis Report</h1>
                  <p className="text-xs text-muted-foreground">
                    Session: {sessionTime || "Loading..."} • ID: {sessionId || "Generating..."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 border-white/5 bg-secondary/30">
                  <Download className="w-4 h-4" /> PDF Report
                </Button>
                <Button variant="outline" size="sm" className="gap-2 border-white/5 bg-secondary/30">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Prediction Summary */}
              <div className="lg:col-span-4 space-y-6">
                <Card className={`glass-card border-l-8 ${isHealthy ? 'border-l-accent' : 'border-l-destructive'}`}>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Primary Prediction</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h2 className={`text-4xl font-black tracking-tight ${isHealthy ? 'text-accent' : 'text-destructive'}`}>
                        {analysisResult.prediction}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        {isHealthy ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{presentationResults.predictionCard.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Confidence Score</span>
                        <span>{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                      <Progress value={analysisResult.confidence * 100} className={`h-2 ${isHealthy ? '[&>div]:bg-accent' : '[&>div]:bg-destructive'}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Source Image</CardTitle>
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
                  <CardHeader>
                    <CardTitle>Multi-Model Voting Consensus</CardTitle>
                    <CardDescription>Individual deep-learning architecture outputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <ModelScoreCard 
                        name="VGG16" 
                        prediction={presentationResults.modelVoting.vgg16.prediction} 
                        score={presentationResults.modelVoting.vgg16.confidence} 
                      />
                      <ModelScoreCard 
                        name="ResNet50" 
                        prediction={presentationResults.modelVoting.resnet50.prediction} 
                        score={presentationResults.modelVoting.resnet50.confidence} 
                      />
                      <ModelScoreCard 
                        name="InceptionV3" 
                        prediction={presentationResults.modelVoting.inceptionv3.prediction} 
                        score={presentationResults.modelVoting.inceptionv3.confidence} 
                      />
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-3 rounded-xl cyan-glow">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-black text-primary tracking-widest">Majority Vote Result</p>
                          <h3 className="text-2xl font-bold text-white">{presentationResults.modelVoting.majorityVoteResult}</h3>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Inference Speed</p>
                        <p className="text-lg font-mono font-bold text-white">420ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="glass-card flex flex-col items-center justify-center p-6 h-[400px]">
                      <h3 className="text-sm font-bold text-muted-foreground mb-4 w-full">Anatomical Context</h3>
                      <HumanBodyVisualizer isDetected={!isHealthy} className="flex-1" />
                   </Card>

                   <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold">Hyperparameter Optimization</CardTitle>
                        <CardDescription>Tuning impact on accuracy</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <AccuracyMetric model="VGG16" before={89} after={91} />
                          <AccuracyMetric model="ResNet50" before={82} after={84} />
                          <AccuracyMetric model="InceptionV3" before={84} after={86} />
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

function ModelScoreCard({ name, prediction, score }: { name: string, prediction: string, score: number }) {
  return (
    <div className="bg-secondary/20 border border-white/5 rounded-xl p-4">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{name}</p>
      <p className="text-sm font-bold text-white mb-1">{prediction}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Confidence</span>
        <span className="text-xs font-mono font-bold text-primary">{score}%</span>
      </div>
      <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div className="bg-primary h-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function AccuracyMetric({ model, before, after }: { model: string, before: number, after: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold">{model}</span>
        <div className="flex gap-3 text-[10px]">
          <span className="text-muted-foreground">Before: {before}%</span>
          <span className="text-accent font-bold">After: {after}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div className="bg-muted-foreground/30 h-full" style={{ width: `${before}%` }} />
        <div className="bg-accent h-full" style={{ width: `${after - before}%` }} />
      </div>
    </div>
  )
}
