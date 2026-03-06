
"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Filter, Search, MoreVertical, Eye, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useFirebase, useMemoFirebase, useCollection } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { format } from "date-fns"

function FormattedDate({ dateString }: { dateString: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />

  try {
    const date = new Date(dateString)
    return (
      <div className="text-[10px] md:text-xs">
        <p className="text-white font-medium">{format(date, 'MMM dd, yyyy')}</p>
        <p className="text-muted-foreground">{format(date, 'HH:mm')}</p>
      </div>
    )
  } catch (e) {
    return <span className="text-[10px] text-muted-foreground">Invalid date</span>
  }
}

export default function ReportsPage() {
  const { firestore } = useFirebase()

  const predictionsQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(
      collection(firestore, 'predictions'),
      orderBy('uploadedAt', 'desc')
    )
  }, [firestore])

  const { data: reports, isLoading } = useCollection(predictionsQuery)

  const handleExportCSV = () => {
    if (!reports || reports.length === 0) return

    const headers = ["Scan ID", "Diagnosis", "Confidence", "Date", "Time", "Original File"]
    const csvRows = reports.map(r => {
      const date = new Date(r.uploadedAt)
      return [
        r.id,
        r.overallPrediction,
        `${r.overallConfidence}%`,
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm:ss'),
        r.originalFileName
      ].join(",")
    })

    const csvContent = [headers.join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `GI_Detect_Archive_${format(new Date(), 'yyyyMMdd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">Clinical Archive</h1>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">Public clinical history for research and diagnostic review.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  disabled={!reports || reports.length === 0}
                  className="flex-1 md:flex-none gap-2 border-white/5 bg-secondary/30 text-xs h-10"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
                <Button className="flex-1 md:flex-none bg-primary text-background font-bold gap-2 cyan-glow h-10" asChild>
                  <Link href="/upload"><FileText className="w-4 h-4" /> New Analysis</Link>
                </Button>
              </div>
            </div>

            <Card className="glass-card">
              <CardHeader className="pb-4 pt-4 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search global records..." className="pl-10 bg-secondary/30 border-none h-10 text-sm" suppressHydrationWarning />
                  </div>
                  <Button variant="outline" className="gap-2 border-white/5 bg-secondary/30 h-10 text-xs">
                    <Filter className="w-4 h-4" /> Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm font-medium">Loading system archive...</p>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-20 px-6 border-y border-white/5">
                    <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white">Archive is empty</h3>
                    <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">No diagnostic scans have been recorded in the system yet.</p>
                    <Button asChild variant="outline" className="h-10 px-6">
                      <Link href="/upload">Perform First Scan</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="min-w-[650px]">
                    <Table>
                      <TableHeader className="border-b border-white/5">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="w-[80px] pl-6">Scan</TableHead>
                          <TableHead>Case ID</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Date / Time</TableHead>
                          <TableHead className="text-right pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="pl-6">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                <Image src={report.imageUrl} alt="Scan" fill className="object-cover" />
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-[10px] font-bold text-primary truncate max-w-[100px]">{report.id}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={report.overallPrediction.toLowerCase() === "healthy" || report.overallPrediction.toLowerCase() === "normal" ? "secondary" : "destructive"}
                                className="text-[9px] px-2 py-0 font-bold uppercase tracking-wider"
                              >
                                {report.overallPrediction}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                 <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden shrink-0">
                                    <div className={`h-full transition-all duration-1000 ${report.overallConfidence > 90 ? 'bg-accent' : report.overallConfidence > 70 ? 'bg-primary' : 'bg-destructive'}`} style={{ width: `${report.overallConfidence}%` }} />
                                 </div>
                                 <span className="text-[10px] font-mono font-bold">{report.overallConfidence}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <FormattedDate dateString={report.uploadedAt} />
                            </TableCell>
                            <TableCell className="text-right pr-6">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
