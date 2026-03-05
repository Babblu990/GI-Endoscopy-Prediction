"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { 
  Activity, 
  TrendingUp, 
  FileCheck, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { format } from "date-fns"

function RelativeTime({ dateString }: { dateString: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <span className="opacity-0">...</span>
  
  try {
    const date = new Date(dateString)
    return <span>{format(date, 'MMM d, HH:mm')}</span>
  } catch (e) {
    return <span>Recently</span>
  }
}

export default function DashboardPage() {
  const { user, firestore } = useFirebase()

  const recentQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, 'users', user.uid, 'predictions'),
      orderBy('uploadedAt', 'desc'),
      limit(5)
    )
  }, [firestore, user])

  const allReportsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return collection(firestore, 'users', user.uid, 'predictions')
  }, [firestore, user])

  const { data: recentReports, isLoading: isRecentLoading } = useCollection(recentQuery)
  const { data: allReports, isLoading: isAllLoading } = useCollection(allReportsQuery)

  const scanCount = allReports?.length || 0
  const systemAccuracy = "94.2%"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Scans" 
                  value={isAllLoading ? "..." : scanCount} 
                  trend="+Live" 
                  icon={Activity} 
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
                <StatCard 
                  title="Overall Accuracy" 
                  value={systemAccuracy} 
                  trend="Stable" 
                  icon={ShieldCheck} 
                  color="text-accent"
                  bgColor="bg-accent/10"
                />
                <StatCard 
                  title="Patient Reports" 
                  value={isAllLoading ? "..." : scanCount} 
                  trend="+Live" 
                  icon={FileCheck} 
                  color="text-cyan-400"
                  bgColor="bg-cyan-400/10"
                />
              </div>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Live Activity Feed</CardTitle>
                    <CardDescription className="text-xs">Hyper-tuned AI diagnostic stream</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary gap-2 h-8 px-2" asChild>
                    <Link href="/reports">View History <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isRecentLoading ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm">Connecting to backend...</span>
                      </div>
                    ) : !recentReports || recentReports.length === 0 ? (
                      <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-white/5">
                        <p className="text-sm text-muted-foreground">No recent scans detected.</p>
                        <Button variant="link" asChild className="text-primary mt-2">
                          <Link href="/upload">Perform your first analysis</Link>
                        </Button>
                      </div>
                    ) : (
                      recentReports.map((report) => {
                        const isAnomalous = report.overallPrediction.toLowerCase() !== 'healthy' && report.overallPrediction.toLowerCase() !== 'normal';
                        return (
                          <div key={report.id} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-all group">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2.5 rounded-lg shrink-0 ${isAnomalous ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>
                                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{report.originalFileName}</p>
                                <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">
                                  ID: {report.id.substring(0, 8)} • <RelativeTime dateString={report.uploadedAt} />
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className={`text-xs font-black uppercase tracking-tighter ${isAnomalous ? "text-destructive" : "text-accent"}`}>
                                {report.overallPrediction}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">CONF: {report.overallConfidence}%</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Inference Latency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-black text-white mb-2">142ms Response</div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[12%]" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase">Backend HPO Active • Global CDN</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">System Version</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-black text-white">V4.2 PRO DEPLOYMENT</div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      Ensemble architecture updated with Esophagitis detection mapping. Accuracy stabilized at 94.2%.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card h-full flex flex-col overflow-hidden min-h-[500px]">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Anatomical Monitoring</CardTitle>
                  <CardDescription className="text-xs">Real-time GI region visualization</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
                  <div className="w-full h-full max-w-[280px] mx-auto">
                    <HumanBodyVisualizer isDetected={false} />
                  </div>
                  <div className="mt-8 w-full p-4 rounded-2xl bg-secondary/30 border border-white/5 text-center max-w-sm mx-auto shadow-xl">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-black">Current Status</p>
                    <p className="text-sm font-black text-primary uppercase tracking-tighter">System Idle • Waiting for Scan</p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatCard({ title, value, trend, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className={`p-2.5 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-accent uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black mt-1.5 tracking-tighter text-white">{value}</h3>
        </div>
      </CardContent>
      <div className={`h-1.5 w-full ${bgColor.replace('/10', '/30')}`} />
    </Card>
  )
}