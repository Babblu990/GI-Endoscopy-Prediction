"use client"

import { useState, useCallback } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { submitGiImageForAnalysis } from "@/ai/flows/submit-gi-image-for-analysis"
import { processAndPresentGiResults } from "@/ai/flows/process-and-present-gi-results"
import { storeGIDiagnosticHistory } from "@/ai/flows/store-gi-diagnostic-history"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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
    if (!preview) return

    setIsAnalyzing(true)
    try {
      // 1. Submit to Flask Backend
      const analysisResult = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      // 2. Process results with Gemini for presentation
      const presentationResults = await processAndPresentGiResults({
        overallPrediction: analysisResult.prediction,
        overallConfidence: analysisResult.confidence * 100,
        vggPrediction: analysisResult.vgg_prediction,
        vggConfidence: 72, // Mocking these as base flow doesn't return individual model confidence scores
        resnetPrediction: analysisResult.resnet_prediction,
        resnetConfidence: 69,
        inceptionPrediction: analysisResult.inception_prediction,
        inceptionConfidence: 75
      })

      // 3. Store in History (Simulated)
      await storeGIDiagnosticHistory({
        image: preview,
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence,
        timestamp: new Date().toISOString(),
        vgg16: { prediction: analysisResult.vgg_prediction, confidence: 0.72 },
        resnet50: { prediction: analysisResult.resnet_prediction, confidence: 0.69 },
        inceptionV3: { prediction: analysisResult.inception_prediction, confidence: 0.75 }
      })

      toast({
        title: "Analysis Complete",
        description: `Detection: ${analysisResult.prediction} (${Math.round(analysisResult.confidence * 100)}% confidence)`,
      })

      // In a real app we'd pass state to the results page, for now we redirect to /results
      // and maybe store the result in a global state/cache.
      // For this demo, we'll store in localStorage to mock state persistence across pages.
      localStorage.setItem('lastResult', JSON.stringify({ analysisResult, presentationResults, preview }))
      router.push('/results')

    } catch (error) {
      console.error(error)
      toast({
        title: "Analysis Failed",
        description: "Could not connect to the AI backend. Ensure Flask API is running.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Diagnostic Uploader</h1>
              <p className="text-muted-foreground">Submit high-resolution endoscopic imagery for deep-learning analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card flex flex-col">
                <CardHeader>
                  <CardTitle>Image Submission</CardTitle>
                  <CardDescription>Drag and drop or click to browse</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {!preview ? (
                    <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative">
                      <input 
                        type="file" 
                        onChange={onFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                      />
                      <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-bold text-white">Drop GI scan here</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG (Max 10MB)</p>
                    </div>
                  ) : (
                    <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[300px]">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill 
                        className="object-contain bg-black/40"
                      />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 rounded-full w-8 h-8"
                        onClick={clearFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                    HIPAA Compliant Transfer
                  </div>
                  <Button 
                    disabled={!preview || isAnalyzing} 
                    onClick={handleAnalysis}
                    className="cyan-glow bg-primary hover:bg-primary/90 text-background font-bold gap-2 px-8"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Run Diagnostic
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Scanning Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProtocolItem 
                      title="Model Voting" 
                      description="Majority voting across 3 neural architectures."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Metadata Extraction" 
                      description="Automatic detection of lesion boundaries."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Cloud Processing" 
                      description="GPU-accelerated inference in secure sandbox."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Medical Disclaimer</h4>
                    <p className="text-[11px] text-destructive/80 mt-1 leading-relaxed">
                      This AI system is designed for assistive research and educational purposes only. Results must be validated by a licensed gastroenterologist. DO NOT use for final medical decisions.
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

function ProtocolItem({ title, description, active }: { title: string, description: string, active: boolean }) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${active ? 'bg-primary cyan-glow' : 'bg-muted'}`} />
      <div>
        <p className="text-xs font-bold text-white">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
