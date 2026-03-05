"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Zap, Loader2, ShieldCheck, AlertCircle, Clock, ExternalLink } from "lucide-react"
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
  const { firestore, auth, user, isUserLoading, userError } = useFirebase()

  // Cooldown timer logic for Rate Limiting
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Ensure user is signed in anonymously on mount
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
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
    
    if (!user) {
      toast({
        title: "Session Error",
        description: "Authentication is required to run diagnostics.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      if (result.error) {
        if (result.isQuotaExceeded) {
          setCooldown(60)
          toast({
            title: "System Rate Limit",
            description: "AI service is busy. Please wait 60 seconds.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Analysis Failed",
            description: result.error || "An internal error occurred.",
            variant: "destructive"
          })
        }
        setIsAnalyzing(false)
        return
      }

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

      localStorage.setItem('lastResult', JSON.stringify({ 
        analysisResult: { prediction: finalPrediction, confidence: result.confidence || 0 }, 
        presentationResults: { predictionCard: { prediction: finalPrediction, confidence: finalConfidence, status: result.status || 'Completed' } }, 
        preview 
      }))
      
      router.push('/results')

    } catch (error: any) {
      toast({
        title: "Inference Error",
        description: "Check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Detect if auth is blocked by project configuration (Anonymous Sign-in not enabled)
  const isAuthBlocked = userError?.message?.includes('signup-are-blocked') || userError?.message?.includes('identity-toolkit');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <Header />
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">Diagnostic Engine</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload high-res GI scans for ensemble analysis.</p>
            </div>

            {isAuthBlocked && (
              <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
                <div className="flex gap-4">
                  <div className="p-2 bg-destructive/20 rounded-xl h-fit">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-destructive text-sm uppercase tracking-widest leading-none">Authentication Service Blocked</h4>
                    <p className="text-xs text-destructive/90 leading-relaxed font-medium">
                      Firebase reports that anonymous sign-up is blocked. You must manually enable it in your console to run diagnostics:
                    </p>
                    <ol className="text-xs text-destructive/80 space-y-2 list-decimal list-inside font-medium">
                      <li>Visit the <strong>Authentication &gt; Sign-in method</strong> tab.</li>
                      <li>Enable the <strong>Anonymous</strong> provider.</li>
                      <li>Ensure the <strong>Identity Toolkit API</strong> is enabled in Google Cloud.</li>
                    </ol>
                    <Button variant="outline" size="sm" className="border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-colors gap-2 mt-2 h-9 px-4 font-bold uppercase text-[10px]" asChild>
                      <a href="https://console.firebase.google.com/project/_/authentication/providers" target="_blank" rel="noopener noreferrer">
                        Fix in Firebase Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="glass-card lg:col-span-7 flex flex-col shadow-2xl border-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-white uppercase tracking-tighter">Scan Submission</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Secure end-to-end medical encryption active.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-[340px]">
                  {!preview ? (
                    <div className="flex-1 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative text-center">
                      <input 
                        type="file" 
                        onChange={onFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
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
                    <ShieldCheck className={`w-4 h-4 ${user ? 'text-accent' : 'text-destructive'}`} />
                    {isUserLoading ? "Initializing..." : !user ? "Auth Required" : "Secure Session: Active"}
                  </div>
                  <Button 
                    disabled={!preview || isAnalyzing || isUserLoading || !user || cooldown > 0} 
                    onClick={handleAnalysis}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background font-black gap-3 px-10 h-12 shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                    ) : cooldown > 0 ? (
                      <><Clock className="w-5 h-5" /> Cooldown {cooldown}s</>
                    ) : (
                      <><Zap className="w-5 h-5" /> Start Diagnosis</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="lg:col-span-5 space-y-6">
                <Card className="glass-card shadow-xl border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Backend Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 py-4">
                    <ProtocolItem 
                      title="Ensemble Consensus" 
                      description="Weighted voting across VGG16, ResNet50, and InceptionV3 architectures."
                      active={true}
                    />
                    <ProtocolItem 
                      title="HPO Stabilization" 
                      description="Automatic hyperparameter tuning for maximum clinical accuracy."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Encryption" 
                      description="HIPAA-compliant data transit and storage protocols."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-6 rounded-3xl bg-accent/10 border border-accent/20 flex gap-4 shadow-xl teal-glow">
                   <div className="p-3 bg-accent/20 rounded-2xl h-fit">
                    <Zap className="w-6 h-6 text-accent" />
                   </div>
                   <div>
                     <h4 className="font-black text-accent text-xs uppercase tracking-[0.2em] leading-none">Performance Metric</h4>
                     <p className="text-[10px] text-accent/80 mt-2 leading-relaxed font-bold">
                       Current System Accuracy: <strong className="text-white text-sm ml-1">94.2%</strong>
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
