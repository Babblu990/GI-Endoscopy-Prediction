"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Zap, Loader2, ShieldCheck, Clock } from "lucide-react"
import Image from "next/image"
import { submitGiImageForAnalysis } from "@/ai/flows/submit-gi-image-for-analysis"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useFirebase, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const { firestore } = useFirebase()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG).",
          variant: "destructive"
        })
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleAnalysis = async () => {
    if (!preview || cooldown > 0 || isAnalyzing) return
    
    setIsAnalyzing(true)
    try {
      const result = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      if (result.error) {
        toast({
          title: "Diagnostic Failed",
          description: result.error,
          variant: "destructive"
        })
        setIsAnalyzing(false)
        return
      }

      const finalPrediction = result.prediction || 'Inconclusive'
      const finalConfidence = Math.round((result.confidence || 0) * 100)

      const predictionsCol = collection(firestore, 'predictions')
      const newDocRef = doc(predictionsCol)
      
      const predictionData = {
        id: newDocRef.id,
        uploadedAt: new Date().toISOString(),
        imageUrl: preview,
        originalFileName: file?.name || 'scan.jpg',
        overallPrediction: finalPrediction,
        overallConfidence: finalConfidence,
        status: result.status || 'Completed'
      }

      setDocumentNonBlocking(newDocRef, predictionData, { merge: true })

      localStorage.setItem('lastResult', JSON.stringify({ 
        id: newDocRef.id,
        analysisResult: { prediction: finalPrediction, confidence: result.confidence || 0 }, 
        presentationResults: { predictionCard: { prediction: finalPrediction, confidence: finalConfidence, status: result.status || 'Completed' } }, 
        preview 
      }))
      
      router.push(`/results?id=${newDocRef.id}`)

    } catch (error: any) {
      toast({
        title: "Inference Error",
        description: "Custom model backend unreachable. Check your network.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">Diagnostic Engine</h1>
              <p className="text-sm text-muted-foreground mt-1">Submit GI scans for ensemble analysis (Global Clinical Portal).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="glass-card lg:col-span-7 flex flex-col shadow-2xl border-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-white uppercase tracking-tighter">Scan Submission</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Direct-to-Cloud processing enabled via custom Flask backend.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-[340px]">
                  {!preview ? (
                    <div className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative text-center">
                      <input 
                        type="file" 
                        onChange={onFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-50"
                        accept="image/*"
                      />
                      <div className="bg-primary/10 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <p className="font-bold text-white text-lg">Select Endoscopic Image</p>
                      <p className="text-[10px] text-muted-foreground mt-2 uppercase font-black tracking-widest">PNG, JPG • MAX 10MB</p>
                    </div>
                  ) : (
                    <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40 group">
                      <Image 
                        src={preview} 
                        alt="Scan Preview" 
                        fill 
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-4 right-4 rounded-full w-10 h-10 z-10 shadow-2xl hover:scale-110 transition-transform"
                        onClick={() => { setFile(null); setPreview(null); }}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 px-8 border-t border-white/5 mt-4 bg-secondary/10">
                  <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Global Portal Access: Active
                  </div>
                  <Button 
                    disabled={!preview || isAnalyzing || cooldown > 0} 
                    onClick={handleAnalysis}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background font-black gap-3 px-10 h-12 shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                    ) : cooldown > 0 ? (
                      <><Clock className="w-5 h-5" /> Cooldown {cooldown}s</>
                    ) : (
                      <><Zap className="w-5 h-5" /> Run Diagnosis</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="lg:col-span-5 space-y-6">
                <Card className="glass-card shadow-xl border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">System Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 py-4">
                    <ProtocolItem 
                      title="Custom Ensemble Logic" 
                      description="VGG16 + ResNet50 + InceptionV3 inference."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Remote GPU Pipeline" 
                      description="External Flask backend processing active."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Anatomical Localizer" 
                      description="Real-time GI region detection mapping."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-6 rounded-3xl bg-accent/10 border border-accent/20 flex gap-4 shadow-xl teal-glow">
                   <div className="p-3 bg-accent/20 rounded-2xl h-fit">
                    <Zap className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                     <h4 className="font-black text-accent text-xs uppercase tracking-[0.2em] leading-none">Inference Precision</h4>
                     <p className="text-[10px] text-accent/80 mt-2 leading-relaxed font-bold">
                       Custom Model Accuracy: <strong className="text-white text-sm ml-1">94.2%</strong>
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ProtocolItem({ title, description, active }: any) {
  return (
    <div className="flex gap-4 group">
      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${active ? 'bg-primary shadow-[0_0_12px_hsl(var(--primary))] scale-110' : 'bg-muted'}`} />
      <div className="min-w-0">
        <p className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 font-medium">{description}</p>
      </div>
    </div>
  )
}
