"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Cpu, 
  Key,
  Save
} from "lucide-react"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white">System Settings</h1>
              <p className="text-muted-foreground">Configure AI parameters and medical data protocols.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="glass-card md:col-span-1 h-fit">
                  <CardContent className="p-2">
                     <div className="space-y-1">
                        {[
                           { icon: Shield, label: "Security & Access" },
                           { icon: Cpu, label: "AI Engine Config" },
                           { icon: Database, label: "Storage Protocols" },
                           { icon: Bell, label: "Alerts & Notifs" },
                           { icon: Globe, label: "Network Settings" },
                        ].map((item, idx) => (
                           <Button key={item.label} variant="ghost" className={`w-full justify-start gap-3 h-11 ${idx === 1 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                              <item.icon className="w-4 h-4" /> {item.label}
                           </Button>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <Card className="glass-card md:col-span-2">
                  <CardHeader>
                     <CardTitle>AI Engine Configuration</CardTitle>
                     <CardDescription>Optimize model performance and inference logic.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <Label className="text-sm font-bold text-white">Ensemble Voting</Label>
                              <p className="text-xs text-muted-foreground">Require consensus from all 3 models for high-risk flags.</p>
                           </div>
                           <Switch defaultChecked />
                        </div>
                        <Separator className="bg-white/5" />
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <Label className="text-sm font-bold text-white">Auto-Augmentation</Label>
                              <p className="text-xs text-muted-foreground">Apply real-time sharpening to low-res endoscopic images.</p>
                           </div>
                           <Switch defaultChecked />
                        </div>
                        <Separator className="bg-white/5" />
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <Label className="text-sm font-bold text-white">Cloud GPU Processing</Label>
                              <p className="text-xs text-muted-foreground">Use external compute for faster multi-model inference.</p>
                           </div>
                           <Switch defaultChecked />
                        </div>
                     </div>

                     <div className="pt-4">
                        <Label className="text-sm font-bold text-white mb-2 block">Detection Threshold (Confidence %)</Label>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full w-[70%]" />
                           </div>
                           <span className="text-sm font-mono font-bold text-primary">70%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 italic">Higher thresholds reduce false positives but may miss subtle anomalies.</p>
                     </div>
                  </CardContent>
                  <Separator className="bg-white/5" />
                  <CardContent className="py-6 flex justify-end gap-3">
                     <Button variant="outline" className="border-white/5">Reset Defaults</Button>
                     <Button className="bg-accent text-background font-bold gap-2 px-8">
                        <Save className="w-4 h-4" /> Save Configuration
                     </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
