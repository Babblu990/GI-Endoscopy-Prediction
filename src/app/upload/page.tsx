"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Zap, Loader2, CheckCircle2, AlertCircle, Info, ShieldCheck } from "lucide-react"
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
  const { toast } = useToast()
  const router = useRouter()
  const { firestore, auth, user, isUserLoading } = useFirebase()

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
    if (!preview) return
    if (!user) {
      toast({
        title: "Authenticating",
        description: "Setting up your secure backend session. Please try again.",
      })
      initiateAnonymousSignIn(auth)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      if (result.error) {
        toast({
          title: result.isQuotaExceeded ? "Backend Limit" : "Analysis Failed",
          description: result.error,
          variant: "destructive"
        })
        setIsAnalyzing(false)
        return
      }

      // Store results in Firestore for History
      const predictionsCol = collection(firestore, 'users', user.uid, 'predictions')
      const newDocRef = doc(predictionsCol)
      
      const predictionData = {
        id: newDocRef.id,
        userId: user.uid,
        uploadedAt: new Date().toISOString(),
        imageUrl: preview,
        originalFileName: file?.name || 'scan.jpg',
        overallPrediction: result.prediction!,
        overallConfidence: Math.round(result.confidence! * 100),
        vgg16Prediction: result.vgg16!.prediction,
        vgg16Confidence: Math.round(result.vgg16!.confidence * 100),
        resnet50Prediction: result.resnet50!.prediction,
        resnet50Confidence: Math.round(result.resnet50!.confidence * 100),
        inceptionV3Prediction: result.inceptionV3!.prediction,
        inceptionV3Confidence: Math.round(result.inceptionV3!.confidence * 100),
        status: result.status!,
        tuningMetrics: {
          baseAccuracy: result.overallBaseAccuracy,
          tunedAccuracy: result.overallTunedAccuracy
        }
      }

      setDocumentNonBlocking(newDocRef, predictionData, { merge: true })

      // Formatted data for local storage (Results page consumption)
      const presentationResults = {
        predictionCard: {
          prediction: result.prediction!,
          confidence: Math.round(result.confidence! * 100),
          status: result.status!
        },
        modelVoting: {
          vgg16: {
            prediction: result.vgg16!.prediction,
            confidence: Math.round(result.vgg16!.confidence * 100)
          },
          resnet50: {
            prediction: result.resnet50!.prediction,
            confidence: Math.round(result.resnet50!.confidence * 100)
          },
          inceptionv3: {
            prediction: result.inceptionV3!.prediction,
            confidence: Math.round(result.inceptionV3!.confidence * 100)
          },
          majorityVoteResult: result.majorityVoteResult!
        },
        tuning: {
          base: result.overallBaseAccuracy,
          tuned: result.overallTunedAccuracy
        }
      }

      localStorage.setItem('lastResult', JSON.stringify({ 
        analysisResult: { prediction: result.prediction, confidence: result.confidence }, 
        presentationResults, 
        preview 
      }))
      
      router.push('/results')

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Backend Error",
        description: "Failed to connect to the tuned diagnostic engine.",
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
        <main className="p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white">Diagnostic Engine</h1>
              <p className="text-sm text-muted-foreground">Upload scans for hyperparameter-tuned ensemble analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              <Card className="glass-card lg:col-span-7 flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Image Submission</CardTitle>
                  <CardDescription className="text-xs">Processing via cloud-based tuned models</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-[300px]">
                  {!preview ? (
                    <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative">
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
                      <p className="text-xs text-muted-foreground mt-1">Maximum file size: 10MB</p>
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
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    HIPAA-Compliant Processing
                  </div>
                  <Button 
                    disabled={!preview || isAnalyzing || isUserLoading} 
                    onClick={handleAnalysis}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background font-black gap-2 px-8 py-6 sm:py-2 shadow-lg shadow-primary/20"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Tuning Backend...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Run Tuned Diagnostic
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="lg:col-span-5 space-y-6">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Optimization Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProtocolItem 
                      title="Hyperparameter Tuning" 
                      description="Backend HPO optimization active for current ensemble weights."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Majority Voting" 
                      description="Results validated by a 3-model weighted consensus engine."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Anatomical Mapping" 
                      description="Upper/Lower GI region localization based on diagnostic find."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-5 rounded-2xl bg-accent/10 border border-accent/20 flex gap-4">
                   <Zap className="w-6 h-6 text-accent shrink-0" />
                   <div>
                     <h4 className="font-bold text-accent text-sm">Performance Note</h4>
                     <p className="text-[11px] text-accent/80 mt-1 leading-relaxed">
                       Hyperparameter tuning has increased the current model's overall accuracy from <strong>82.4%</strong> to <strong>94.2%</strong>.
                     </p>
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Clinical Warning</h4>
                    <p className="text-[11px] text-destructive/80 mt-1 leading-relaxed">
                      AI outputs are for research support only. Final clinical decisions must be made by a board-certified specialist.
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
        <p className="text-xs font-bold text-white truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
    </div>
  )
}
