"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Zap, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react"
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
        description: "Setting up your secure session. Please try again in a moment.",
      })
      initiateAnonymousSignIn(auth)
      return
    }

    setIsAnalyzing(true)
    try {
      // Single call to consolidated AI flow (reduces API quota usage by 50%)
      const result = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      // Store results in Firestore for History
      const predictionsCol = collection(firestore, 'users', user.uid, 'predictions')
      const newDocRef = doc(predictionsCol)
      
      const predictionData = {
        id: newDocRef.id,
        userId: user.uid,
        uploadedAt: new Date().toISOString(),
        imageUrl: preview,
        originalFileName: file?.name || 'scan.jpg',
        overallPrediction: result.prediction,
        overallConfidence: Math.round(result.confidence * 100),
        vgg16Prediction: result.vgg16.prediction,
        vgg16Confidence: Math.round(result.vgg16.confidence * 100),
        resnet50Prediction: result.resnet50.prediction,
        resnet50Confidence: Math.round(result.resnet50.confidence * 100),
        inceptionV3Prediction: result.inceptionV3.prediction,
        inceptionV3Confidence: Math.round(result.inceptionV3.confidence * 100),
        status: result.status
      }

      setDocumentNonBlocking(newDocRef, predictionData, { merge: true })

      toast({
        title: "Analysis Complete",
        description: `Detection: ${result.prediction} (${Math.round(result.confidence * 100)}% confidence)`,
      })

      // Construct formatted local storage data for the results page
      const presentationResults = {
        predictionCard: {
          prediction: result.prediction,
          confidence: Math.round(result.confidence * 100),
          status: result.status
        },
        modelVoting: {
          vgg16: {
            prediction: result.vgg16.prediction,
            confidence: Math.round(result.vgg16.confidence * 100)
          },
          resnet50: {
            prediction: result.resnet50.prediction,
            confidence: Math.round(result.resnet50.confidence * 100)
          },
          inceptionv3: {
            prediction: result.inceptionV3.prediction,
            confidence: Math.round(result.inceptionV3.confidence * 100)
          },
          majorityVoteResult: result.majorityVoteResult
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
      const isQuotaError = error.message?.includes('429') || error.message?.includes('quota')
      
      toast({
        title: isQuotaError ? "Quota Exceeded" : "Analysis Failed",
        description: isQuotaError 
          ? "The AI service is currently at capacity. Please wait a minute before trying again." 
          : "AI analysis encountered an error. Please try again.",
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
              <p className="text-muted-foreground">Submit high-resolution endoscopic imagery for ensemble neural analysis.</p>
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
                    Secure Sandbox Inference
                  </div>
                  <Button 
                    disabled={!preview || isAnalyzing || isUserLoading} 
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
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Inference Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ProtocolItem 
                      title="Ensemble Analysis" 
                      description="Consolidated majority voting across VGG16, ResNet50, and InceptionV3 architectures."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Medical Image Proxy" 
                      description="Using Gemini 2.5 Flash as a high-precision diagnostic interpreter."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Optimized Pipeline" 
                      description="Single-pass processing to maximize quota efficiency and speed."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4">
                   <Info className="w-6 h-6 text-primary shrink-0" />
                   <div>
                     <h4 className="font-bold text-primary text-sm">System Note</h4>
                     <p className="text-[11px] text-primary/80 mt-1 leading-relaxed">
                       This prototype simulates your custom ensemble. It now includes detection for <strong>Esophagitis</strong> and maps <strong>Infection</strong> to upper GI regions.
                     </p>
                   </div>
                </div>

                <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Medical Disclaimer</h4>
                    <p className="text-[11px] text-destructive/80 mt-1 leading-relaxed">
                      Assistive research purposes only. Results must be validated by a licensed gastroenterologist. DO NOT use for clinical decisions.
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
