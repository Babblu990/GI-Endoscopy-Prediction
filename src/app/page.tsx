"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HumanBodyVisualizer } from "@/components/dashboard/human-body-visualizer"
import { 
  Activity, 
  TrendingUp, 
  Users, 
  FileCheck, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Stats Section */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Scans" 
                  value="1,284" 
                  trend="+12%" 
                  icon={Activity} 
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
                <StatCard 
                  title="Accuracy" 
                  value="94.2%" 
                  trend="+2.1%" 
                  icon={ShieldCheck} 
                  color="text-accent"
                  bgColor="bg-accent/10"
                />
                <StatCard 
                  title="Patient Reports" 
                  value="856" 
                  trend="+5%" 
                  icon={FileCheck} 
                  color="text-cyan-400"
                  bgColor="bg-cyan-400/10"
                />
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">Recent Diagnostic Activity</CardTitle>
                      <CardDescription>Real-time AI analysis feed</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary gap-2" asChild>
                      <Link href="/reports">View All <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: "RX-901", patient: "John Doe", diagnosis: "Healthy", confidence: "98%", status: "Confirmed", time: "2m ago" },
                      { id: "RX-899", patient: "Alice Smith", diagnosis: "Polyp Detected", confidence: "74%", status: "Pending", time: "15m ago" },
                      { id: "RX-898", patient: "Robert Brown", diagnosis: "Ulcerous Tissue", confidence: "86%", status: "Confirmed", time: "1h ago" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${item.diagnosis.includes("Detected") || item.diagnosis.includes("Ulcerous") ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.patient}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {item.id} • {item.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${item.diagnosis.includes("Detected") || item.diagnosis.includes("Ulcerous") ? "text-destructive" : "text-accent"}`}>
                            {item.diagnosis}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Confidence: {item.confidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">System Load</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">Low Utility</div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[15%]" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Latency: 142ms • Servers: North America 1</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-l-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Research Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">Model v4.2 Deployment</div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      New dataset from NIH integrated. Accuracy for "Ulcer" detection improved by 4.5%.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Interactive Section */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg font-bold">Anatomical Monitoring</CardTitle>
                  <CardDescription>Live GI region visualization</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                  <HumanBodyVisualizer isDetected={false} />
                  <div className="mt-4 w-full p-4 rounded-xl bg-secondary/30 border border-white/5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current Focus</p>
                    <p className="text-sm font-bold text-primary">Lower Gastrointestinal Tract</p>
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
    <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
        </div>
      </CardContent>
      <div className={`h-1 w-full ${bgColor.replace('/10', '/30')}`} />
    </Card>
  )
}
