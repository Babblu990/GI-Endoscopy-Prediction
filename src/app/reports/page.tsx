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
      <div className="text-xs">
        <p className="text-white">{format(date, 'MMM dd, yyyy')}</p>
        <p className="text-muted-foreground">{format(date, 'HH:mm')}</p>
      </div>
    )
  } catch (e) {
    return <span className="text-xs text-muted-foreground">Invalid date</span>
  }
}

export default function ReportsPage() {
  const { user, firestore } = useFirebase()

  const predictionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, 'users', user.uid, 'predictions'),
      orderBy('uploadedAt', 'desc')
    )
  }, [firestore, user])

  const { data: reports, isLoading } = useCollection(predictionsQuery)

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
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading historical records...</p>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                    <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white">No reports found</h3>
                    <p className="text-muted-foreground mb-6">You haven't performed any AI diagnostic scans yet.</p>
                    <Button asChild variant="outline">
                      <Link href="/upload">Upload First Image</Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="border-b border-white/5">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[100px]">Scan</TableHead>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Date / Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                              <Image src={report.imageUrl} alt="Scan" fill className="object-cover" />
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-primary truncate max-w-[120px]">{report.id}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={report.overallPrediction.toLowerCase() === "healthy" || report.overallPrediction.toLowerCase() === "normal" ? "secondary" : "destructive"}
                              className="text-[10px] px-2 py-0"
                            >
                              {report.overallPrediction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                               <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${report.overallConfidence > 90 ? 'bg-accent' : report.overallConfidence > 70 ? 'bg-primary' : 'bg-destructive'}`} style={{ width: `${report.overallConfidence}%` }} />
                               </div>
                               <span className="text-xs font-mono font-bold">{report.overallConfidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <FormattedDate dateString={report.uploadedAt} />
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
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
