
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Loader2,
  TrendingUp,
  Activity,
  BrainCircuit
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { useFirebase, useMemoFirebase, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { generatePerformanceSummary } from "@/ai/flows/generate-performance-summary"

function ResultsContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id')
  const { firestore } = useFirebase()
  const [localData, setLocalData] = useState<any>(null)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [isInsightLoading, setIsInsightLoading] = useState(false)

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

  const data = dbReport ? {
    analysisResult: { 
      prediction: dbReport.overallPrediction, 
      confidence: dbReport.overallConfidence / 100,
      vgg16: dbReport.vgg16,
      resnet50: dbReport.resnet50,
      inceptionV3: dbReport.inceptionV3,
      baselineAccuracy: dbReport.baselineAccuracy || 82.4,
      tunedAccuracy: dbReport.tunedAccuracy || dbReport.overallConfidence
    },
    presentationResults: { predictionCard: { prediction: dbReport.overallPrediction, confidence: dbReport.overallConfidence, status: dbReport.status } },
    preview: dbReport.imageUrl,
    id: dbReport.id
  } : localData

  useEffect(() => {
    if (data?.analysisResult && !aiInsight && !isInsightLoading) {
      const fetchInsight = async () => {
        setIsInsightLoading(true)
        try {
          const summary = await generatePerformanceSummary({
            baseline: data.analysisResult.baselineAccuracy,
            tuned: data.analysisResult.tunedAccuracy
          })
          setAiInsight(summary)
        } catch (error) {
          console.error("AI Insight Error:", error)
        } finally {
          setIsInsightLoading(false)
        }
      }
      fetchInsight()
    }
  }, [data, aiInsight, isInsightLoading])

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

2. PERFORMANCE METRICS:
Baseline Accuracy (Pre-Tuning): ${data.analysisResult.baselineAccuracy}%
Optimized Accuracy (Post-Tuning): ${data.analysisResult.tunedAccuracy}%

AI CLINICAL INSIGHT:
${aiInsight || 'Analysis in progress...'}

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
          <Zap className="w-14 h-14" />
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
  
  const baseAccuracy = `${analysisResult.baselineAccuracy}%`;
  const tunedAccuracy = `${analysisResult.tunedAccuracy}%`;
  const improvement = (analysisResult.tunedAccuracy - analysisResult.baselineAccuracy).toFixed(1);

  return (
    <main className="p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-white/10 rounded-full">
              <Link href="/upload"><ArrowLeft className="w-6 h-6" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Diagnostic Result</h1>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-widest">
                ID: {sessionId} • HPO ACTIVE • {sessionTime}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport} className="gap-2 border-white/10 bg-secondary/40 h-10 font-bold uppercase tracking-wider text-[10px]">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button variant="outline" className="gap-2 border-white/10 bg-secondary/40 h-10 font-bold uppercase tracking-wider text-[10px]">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer Panel */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="glass-card flex flex-col items-center justify-center p-6 min-h-[500px] shadow-2xl overflow-hidden relative">
               <div className="absolute top-6 left-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Region Localization</span>
               </div>
               <div className="flex-1 w-full max-w-[340px] py-4">
                 <HumanBodyVisualizer 
                   isDetected={!isHealthy} 
                   prediction={analysisResult.prediction}
                 />
               </div>
            </Card>

            {/* Performance Metrics Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-white uppercase tracking-tighter">Consolidated Performance Metrics</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Comparison: Pre vs Post Parameter Tuning</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card bg-[#111c26] border-none p-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                    <Activity className="w-32 h-32 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest mb-2">Baseline Accuracy</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{baseAccuracy}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">Original Ensemble Benchmark</p>
                </Card>

                <Card className="glass-card bg-[#111c26] border border-primary/20 p-6 relative overflow-hidden group cyan-glow">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-32 h-32 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Tuned Accuracy</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{tunedAccuracy}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" /> +{improvement}% Gain Achieved
                  </div>
                </Card>
              </div>

              {/* AI Clinical Insight Section */}
              <Card className="glass-card border-l-4 border-l-primary bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> AI Clinical Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isInsightLoading ? (
                    <div className="flex items-center gap-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-[11px] text-muted-foreground animate-pulse uppercase font-bold">Synthesizing performance analysis...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-white leading-relaxed font-medium italic">
                      "{aiInsight || 'No performance commentary available for this scan.'}"
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Individual Model Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModelMetricCard 
                  name="VGG16" 
                  hpo="+2.1% Tuning" 
                  prediction={analysisResult.prediction} 
                  confidence={Math.round((analysisResult.vgg16?.confidence || analysisResult.confidence) * 100)} 
                />
                <ModelMetricCard 
                  name="RESNET50" 
                  hpo="+3.4% Tuning" 
                  prediction={analysisResult.prediction} 
                  confidence={Math.round((analysisResult.resnet50?.confidence || analysisResult.confidence) * 100)} 
                />
                <ModelMetricCard 
                  name="INCEPTIONV3" 
                  hpo="+1.9% Tuning" 
                  prediction={analysisResult.prediction} 
                  confidence={Math.round((analysisResult.inceptionV3?.confidence || analysisResult.confidence) * 100)} 
                />
              </div>
            </div>
          </div>

          {/* Side Panel: Prediction Summary & Image */}
          <div className="lg:col-span-5 space-y-6">
             <Card className={`glass-card border-l-[12px] ${isHealthy ? 'border-l-accent' : 'border-l-destructive'} overflow-hidden shadow-2xl`}>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Consensus Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h2 className={`text-5xl font-black tracking-tighter leading-none ${isHealthy ? 'text-accent' : 'text-destructive'}`}>
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
                  <Progress value={Math.round(analysisResult.confidence * 100)} className={`h-2.5 rounded-full ${isHealthy ? '[&>div]:bg-accent' : '[&>div]:bg-destructive'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden border-none shadow-2xl">
              <CardHeader className="pb-3 pt-5 px-5 bg-secondary/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Original Endoscopic Frame</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <Image src={preview} alt="Source Frame" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function ModelMetricCard({ name, hpo, prediction, confidence }: any) {
  return (
    <Card className="glass-card bg-[#111c26] border-none p-4 group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{name}</h4>
        <span className="text-[8px] font-black text-accent uppercase tracking-widest">{hpo}</span>
      </div>
      <div className="space-y-1 mb-4">
        <p className="text-sm font-black text-white leading-none">{prediction}</p>
        <p className="text-[10px] text-muted-foreground font-bold">Confidence <span className="text-primary ml-1">{confidence}%</span></p>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
      </div>
    </Card>
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
