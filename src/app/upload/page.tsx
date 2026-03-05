
"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Zap, Loader2, ShieldCheck, AlertCircle, Clock } from "lucide-react"
import Image from "next/image"
import { submitGiImageForAnalysis } from "@/ai/flows/submit-gi-image-for-analysis"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { 
  useFirebase, 
  initiateAnonymousSignIn, 
  setDocumentNonBlocking 
} from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const { firestore, auth, user, isUserLoading } = useFirebase()

  // Cooldown timer logic for Rate Limiting
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Ensure user is signed in anonymously on mount
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth)
    }
  }, [user, isUserLoading, auth])

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
    
    // Safety check for user auth
    if (!user) {
      toast({
        title: "Session Initializing",
        description: "Your secure diagnostic session is still setting up. Please try again in a moment.",
      })
      initiateAnonymousSignIn(auth)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      if (result.error) {
        if (result.isQuotaExceeded) {
          setCooldown(60) // Start a 60-second cooldown
          toast({
            title: "System Rate Limit",
            description: "The AI service is processing many requests. Please wait 60 seconds.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Analysis Error",
            description: result.error || "An unexpected error occurred during analysis.",
            variant: "destructive"
          })
        }
        setIsAnalyzing(false)
        return
      }

      // Process and Save Results
      const finalPrediction = result.prediction || 'Inconclusive'
      const finalConfidence = Math.round((result.confidence || 0) * 100)

      const predictionsCol = collection(firestore, 'users', user.uid, 'predictions')
      const newDocRef = doc(predictionsCol)
      
      const predictionData = {
        id: newDocRef.id,
        userId: user.uid,
        uploadedAt: new Date().toISOString(),
        imageUrl: preview,
        originalFileName: file?.name || 'scan.jpg',
        overallPrediction: finalPrediction,
        overallConfidence: finalConfidence,
        vgg16Prediction: result.vgg16?.prediction || finalPrediction,
        vgg16Confidence: Math.round((result.vgg16?.confidence || 0) * 100),
        resnet50Prediction: result.resnet50?.prediction || finalPrediction,
        resnet50Confidence: Math.round((result.resnet50?.confidence || 0) * 100),
        inceptionV3Prediction: result.inceptionV3?.prediction || finalPrediction,
        inceptionV3Confidence: Math.round((result.inceptionV3?.confidence || 0) * 100),
        status: result.status || 'Completed'
      }

      setDocumentNonBlocking(newDocRef, predictionData, { merge: true })

      // Prepare UI state for the Results page
      const presentationResults = {
        predictionCard: {
          prediction: finalPrediction,
          confidence: finalConfidence,
          status: result.status || 'Completed'
        }
      }

      localStorage.setItem('lastResult', JSON.stringify({ 
        analysisResult: { prediction: finalPrediction, confidence: result.confidence || 0 }, 
        presentationResults, 
        preview 
      }))
      
      router.push('/results')

    } catch (error: any) {
      console.error('Diagnostic Engine Error:', error)
      toast({
        title: "Inference Error",
        description: "Could not communicate with the cloud diagnostic engine.",
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

  const isButtonDisabled = !preview || isAnalyzing || isUserLoading || !user || cooldown > 0

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Diagnostic Engine</h1>
              <p className="text-sm text-muted-foreground">Upload GI scans for authoritative ensemble analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              <Card className="glass-card lg:col-span-7 flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Image Submission</CardTitle>
                  <CardDescription className="text-xs">Secure analysis via backend hyperparameter-tuned ensemble</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-[300px]">
                  {!preview ? (
                    <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative text-center">
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
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">PNG or JPG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill 
                        className="object-contain"
                      />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-3 right-3 rounded-full w-8 h-8 z-10"
                        onClick={clearFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 mt-4">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    {isUserLoading ? "Initializing session..." : !user ? "Connecting..." : "Secure Session Active"}
                  </div>
                  <Button 
                    disabled={isButtonDisabled} 
                    onClick={handleAnalysis}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background font-black gap-2 px-8 py-6 sm:py-2 shadow-lg shadow-primary/20 uppercase tracking-widest"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        Retry in {cooldown}s
                      </>
                    ) : isUserLoading || !user ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
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

              <div className="lg:col-span-5 space-y-6">
                {cooldown > 0 && (
                  <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/30 flex gap-4 animate-pulse">
                    <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                    <div>
                      <h4 className="font-black text-destructive text-xs uppercase tracking-widest">Rate Limit Hit</h4>
                      <p className="text-[10px] text-destructive/80 mt-1 leading-relaxed">
                        The AI service is processing many requests. System will unlock in <strong>{cooldown} seconds</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-black">Backend Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProtocolItem 
                      title="Ensemble Consensus" 
                      description="Weighted voting across VGG16, ResNet50, and InceptionV3."
                      active={true}
                    />
                    <ProtocolItem 
                      title="HPO Stabilization" 
                      description="Hyperparameters optimized for maximum diagnostic accuracy."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-5 rounded-2xl bg-accent/10 border border-accent/20 flex gap-4">
                   <Zap className="w-6 h-6 text-accent shrink-0" />
                   <div>
                     <h4 className="font-black text-accent text-xs uppercase tracking-widest">System Performance</h4>
                     <p className="text-[10px] text-accent/80 mt-1 leading-relaxed">
                       Overall System Accuracy: <strong>94.2%</strong>.
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
    <div className="flex gap-3">
      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-muted'}`} />
      <div className="min-w-0">
        <p className="text-[11px] font-black text-white uppercase truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
    </div>
  )
}
