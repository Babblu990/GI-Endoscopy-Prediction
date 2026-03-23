"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, CheckCircle2, AlertTriangle, Zap, BarChart3, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { useFirebase, useMemoFirebase, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"

function ResultsContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id')
  const { firestore } = useFirebase()
  const [localData, setLocalData] = useState<any>(null)

  const memoizedDocRef = useMemoFirebase(() => {
    if (!firestore || !reportId) return null
    return doc(firestore, 'predictions', reportId)
  }, [firestore, reportId])

  const { data: dbReport, isLoading: isDocLoading } = useDoc(memoizedDocRef)

  useEffect(() => {
    const saved = localStorage.getItem('lastResult')
    if (saved) {
      setLocalData(JSON.parse(saved))
    }
  }, [])

  // Determine the active report data
  const data = dbReport ? {
    analysisResult: { prediction: dbReport.overallPrediction, confidence: dbReport.overallConfidence / 100 },
    presentationResults: { predictionCard: { prediction: dbReport.overallPrediction, confidence: dbReport.overallConfidence, status: dbReport.status } },
    preview: dbReport.imageUrl,
    id: dbReport.id
  } : localData

  const sessionId = data?.id || "DX-PENDING"
  const sessionTime = new Date().toLocaleTimeString()

  const handleExportReport = () => {
    if (!data) return
    
    const reportText = `
GI DETECT AI - CLINICAL DIAGNOSTIC REPORT
-----------------------------------------
Report ID: ${sessionId}
Date: ${new Date().toLocaleDateString()}
Time: ${sessionTime}
Status: ${data.presentationResults.predictionCard.status}

1. DIAGNOSTIC FINDING:
Consensus Prediction: ${data.analysisResult.prediction}
Confidence Score: ${Math.round(data.analysisResult.confidence * 100)}%

2. ARCHITECTURE PERFORMANCE:
Final Overall System Accuracy: ${Math.round(data.analysisResult.confidence * 100)}%
Core Logic: Backend Hyperparameter-Tuned Ensemble
Models Consulted: VGG16, ResNet50, InceptionV3 (Majority Vote)

3. ANATOMICAL NOTES:
Region: ${data.analysisResult.prediction.toLowerCase().includes('esophagitis') || data.analysisResult.prediction.toLowerCase().includes('infection') ? 'Upper GI (Esophagus)' : 'Mid/Lower GI'}

-----------------------------------------
Disclaimer: This is an AI-generated research output. All findings must be confirmed by a board-certified gastroenterologist.
    `

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `GI_Report_${sessionId}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isDocLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-white font-bold uppercase tracking-widest">Retrieving Diagnostic Data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-secondary/30 p-10 rounded-full mb-6 text-muted-foreground shadow-2xl">
          <Info className="w-14 h-14" />
        </div>
        <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tighter">No Scan Data Found</h2>
        <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto font-medium">Please perform a diagnostic upload to view the results.</p>
        <Button asChild className="bg-primary text-background font-black px-12 py-6 rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-widest hover:scale-105 transition-transform">
          <Link href="/upload">Start New Analysis</Link>
        </Button>
      </div>
    )
  }

  const { analysisResult, presentationResults, preview } = data
  const isHealthy = analysisResult.prediction.toLowerCase() === 'healthy' || analysisResult.prediction.toLowerCase() === 'normal'

  return (
    <main className="p-4 md:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-white/10 rounded-full">
              <Link href="/upload"><ArrowLeft className="w-6 h-6" /></Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black text-white truncate uppercase tracking-tighter leading-none">Diagnostic Result</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground truncate font-mono mt-1">
                ID: {sessionId} • HPO TUNING ACTIVE • {sessionTime}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleExportReport}
              className="flex-1 md:flex-none gap-2 border-white/10 bg-secondary/40 h-11 px-6 font-bold uppercase tracking-wider text-xs"
            >
              <Download className="w-4 h-4" /> Export Report
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none gap-2 border-white/10 bg-secondary/40 h-11 px-6 font-bold uppercase tracking-wider text-xs">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Card className={`glass-card border-l-[12px] ${isHealthy ? 'border-l-accent' : 'border-l-destructive'} overflow-hidden shadow-2xl`}>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Backend System Consensus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-none ${isHealthy ? 'text-accent' : 'text-destructive'}`}>
                    {analysisResult.prediction}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    {isHealthy ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <AlertTriangle className="w-5 h-5 text-destructive" />}
                    <span className="text-xs font-black uppercase tracking-widest text-white">{presentationResults.predictionCard.status}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Inference Confidence</span>
                    <span className="text-white font-mono">{Math.round(analysisResult.confidence * 100)}%</span>
                  </div>
                  <Progress value={analysisResult.confidence * 100} className={`h-2.5 rounded-full ${isHealthy ? '[&>div]:bg-accent' : '[&>div]:bg-destructive'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden border-none shadow-2xl">
              <CardHeader className="pb-3 pt-5 px-5 bg-secondary/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analyzed Image Source</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <Image src={preview} alt="Source Frame" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <Card className="glass-card overflow-hidden border-t-8 border-t-primary shadow-2xl">
              <CardHeader className="pb-6 pt-8 px-8">
                <div className="flex items-center gap-3">
                   <BarChart3 className="w-6 h-6 text-primary" />
                   <CardTitle className="text-xl font-black uppercase tracking-tight text-white">System Accuracy Benchmarks</CardTitle>
                </div>
                <CardDescription className="text-xs font-medium text-muted-foreground">Authoritative diagnostic performance calculated by backend ensemble logic.</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-accent/15 rounded-3xl p-8 border border-accent/30 cyan-glow flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Result Accuracy</p>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {Math.round(analysisResult.confidence * 100)}%
                    </div>
                    <p className="text-[11px] text-accent/80 mt-3 font-black uppercase tracking-widest">Backend Tuned</p>
                  </div>
                  
                  <div className="bg-secondary/30 border border-white/10 rounded-3xl p-8 flex flex-col justify-center shadow-inner">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="bg-primary/20 p-3 rounded-2xl">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Logic Model</p>
                        <h3 className="text-base font-black text-white truncate uppercase tracking-tighter">Tuned Ensemble</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                      "Individual model inputs (VGG16, ResNet50, InceptionV3) processed via weighted majority voting to ensure clinical consensus."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card flex flex-col items-center justify-center p-8 min-h-[450px] shadow-2xl overflow-hidden relative">
               <div className="absolute top-6 left-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Live Region Localization</span>
               </div>
               <div className="flex-1 w-full max-w-[340px] py-4">
                 <HumanBodyVisualizer 
                   isDetected={!isHealthy} 
                   prediction={analysisResult.prediction}
                 />
               </div>
               <div className="mt-8 p-4 rounded-2xl bg-secondary/40 border border-white/10 text-[10px] text-white/80 text-center uppercase font-black tracking-widest w-full max-w-sm shadow-xl">
                 Region: {isHealthy ? "Healthy Tissue Mapping" : analysisResult.prediction}
               </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        }>
          <ResultsContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
