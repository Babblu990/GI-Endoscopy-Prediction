"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2
} from "lucide-react"
import Link from "next/link"
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
      try {
        const parsed = JSON.parse(saved)
        setLocalData(parsed)
      } catch (e) {
        console.error("Error parsing local data", e)
      }
    }
  }, [])

  const data = dbReport ? {
    analysisResult: { 
      prediction: dbReport.overallPrediction, 
      confidence: dbReport.overallConfidence / 100,
    },
    presentationResults: { 
      predictionCard: { 
        prediction: dbReport.overallPrediction, 
        confidence: dbReport.overallConfidence, 
        status: dbReport.status 
      } 
    },
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

DIAGNOSTIC FINDING:
Consensus Prediction: ${data.analysisResult?.prediction || 'N/A'}
Confidence Score: ${Math.round((data.analysisResult?.confidence || 0) * 100)}%
-----------------------------------------
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

  if (!data || !data.analysisResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black mb-2 text-white uppercase tracking-tighter">No Scan Data Found</h2>
        <Button asChild className="bg-primary text-background font-black px-12 py-6 rounded-2xl mt-6 uppercase tracking-widest">
          <Link href="/upload">Start New Analysis</Link>
        </Button>
      </div>
    )
  }

  const { analysisResult, presentationResults } = data
  const isHealthy = analysisResult.prediction.toLowerCase() === 'healthy' || analysisResult.prediction.toLowerCase() === 'normal'
  
  return (
    <main className="p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-white/10 rounded-full">
              <Link href="/upload"><ArrowLeft className="w-6 h-6" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Diagnostic Result</h1>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-widest">
                ID: {sessionId} • SYSTEM ACTIVE • {sessionTime}
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
          <div className="lg:col-span-7 space-y-6">
            <Card className="glass-card flex flex-col items-center justify-center p-4 min-h-[500px] shadow-2xl overflow-hidden relative border-none">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Anatomical Monitoring</span>
              </div>
              <div className="flex-1 w-full max-w-[280px]">
                <HumanBodyVisualizer 
                  isDetected={!isHealthy} 
                  prediction={analysisResult.prediction}
                />
              </div>
            </Card>
          </div>

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
                    <span className="text-xs font-black uppercase tracking-widest text-white">{presentationResults?.predictionCard?.status || 'Detected'}</span>
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

            <Card className="glass-card border-none bg-secondary/20">
              <CardContent className="p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">Clinical Protocol Note</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This analysis was performed using the standard ensemble processing pipeline. High-precision region localization is active based on the consensus voting system.
                </p>
              </CardContent>
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
