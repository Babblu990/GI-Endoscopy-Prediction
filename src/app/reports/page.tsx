"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Filter, Search, MoreVertical, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

const MOCK_REPORTS = [
  { id: "RX-901", patient: "John Doe", diagnosis: "Healthy", confidence: 98, date: "2024-05-15", time: "14:20", image: "https://picsum.photos/seed/scan1/100/100" },
  { id: "RX-899", patient: "Alice Smith", diagnosis: "Polyp Detected", confidence: 74, date: "2024-05-14", time: "09:45", image: "https://picsum.photos/seed/scan2/100/100" },
  { id: "RX-898", patient: "Robert Brown", diagnosis: "Ulcerous Tissue", confidence: 86, date: "2024-05-14", time: "11:12", image: "https://picsum.photos/seed/scan3/100/100" },
  { id: "RX-897", patient: "Michael Green", diagnosis: "Healthy", confidence: 99, date: "2024-05-12", time: "16:30", image: "https://picsum.photos/seed/scan4/100/100" },
  { id: "RX-896", patient: "Sarah Wilson", diagnosis: "Vascular Ectasia", confidence: 68, date: "2024-05-11", time: "08:15", image: "https://picsum.photos/seed/scan5/100/100" },
  { id: "RX-895", patient: "James Taylor", diagnosis: "Healthy", confidence: 96, date: "2024-05-10", time: "13:40", image: "https://picsum.photos/seed/scan6/100/100" },
]

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Diagnostic History</h1>
                <p className="text-muted-foreground">Comprehensive archive of all patient scans and AI analyses.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 border-white/5 bg-secondary/30">
                  <Download className="w-4 h-4" /> Export All
                </Button>
                <Button className="bg-primary text-background font-bold gap-2 cyan-glow" asChild>
                  <Link href="/upload"><FileText className="w-4 h-4" /> New Report</Link>
                </Button>
              </div>
            </div>

            <Card className="glass-card">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-10 bg-secondary/30 border-none h-10" />
                  </div>
                  <Button variant="outline" className="gap-2 border-white/5 bg-secondary/30">
                    <Filter className="w-4 h-4" /> Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="border-b border-white/5">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px]">Scan</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_REPORTS.map((report) => (
                      <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                            <Image src={report.image} alt="Scan" fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary">{report.id}</TableCell>
                        <TableCell className="font-medium text-white">{report.patient}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={report.diagnosis.includes("Detected") || report.diagnosis.includes("Tissue") || report.diagnosis.includes("Ectasia") ? "destructive" : "secondary"}
                            className="text-[10px] px-2 py-0"
                          >
                            {report.diagnosis}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${report.confidence > 90 ? 'bg-accent' : report.confidence > 70 ? 'bg-primary' : 'bg-destructive'}`} style={{ width: `${report.confidence}%` }} />
                             </div>
                             <span className="text-xs font-mono font-bold">{report.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="text-white">{report.date}</p>
                            <p className="text-muted-foreground">{report.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
