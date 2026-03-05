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
import { processAndPresentGiResults } from "@/ai/flows/process-and-present-gi-results"
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

  // Ensure user is signed in anonymously to satisfy Firestore rules
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
      // 1. Analyze with Gemini (Simulating ensemble architectures)
      const analysisResult = await submitGiImageForAnalysis({ imageDataUri: preview })
      
      // 2. Process results with Gemini for the detailed UI summary
      const presentationResults = await processAndPresentGiResults({
        overallPrediction: analysisResult.prediction,
        overallConfidence: analysisResult.confidence * 100,
        vggPrediction: analysisResult.vgg_prediction,
        vggConfidence: Math.round(analysisResult.vgg_confidence * 100),
        resnetPrediction: analysisResult.resnet_prediction,
        resnetConfidence: Math.round(analysisResult.resnet_confidence * 100),
        inceptionPrediction: analysisResult.inception_prediction,
        inceptionConfidence: Math.round(analysisResult.inception_confidence * 100)
      })

      // 3. Store results in Firestore for History
      const predictionsCol = collection(firestore, 'users', user.uid, 'predictions')
      const newDocRef = doc(predictionsCol)
      
      const predictionData = {
        id: newDocRef.id,
        userId: user.uid,
        uploadedAt: new Date().toISOString(),
        imageUrl: preview,
        originalFileName: file?.name || 'scan.jpg',
        overallPrediction: analysisResult.prediction,
        overallConfidence: Math.round(analysisResult.confidence * 100),
        vgg16Prediction: analysisResult.vgg_prediction,
        vgg16Confidence: Math.round(analysisResult.vgg_confidence * 100),
        resnet50Prediction: analysisResult.resnet_prediction,
        resnet50Confidence: Math.round(analysisResult.resnet_confidence * 100),
        inceptionV3Prediction: analysisResult.inception_prediction,
        inceptionV3Confidence: Math.round(analysisResult.inception_confidence * 100),
        status: presentationResults.predictionCard.status
      }

      setDocumentNonBlocking(newDocRef, predictionData, { merge: true })

      toast({
        title: "Analysis Complete",
        description: `Detection: ${analysisResult.prediction} (${Math.round(analysisResult.confidence * 100)}% confidence)`,
      })

      // Store locally for the immediate results page view
      localStorage.setItem('lastResult', JSON.stringify({ analysisResult, presentationResults, preview }))
      router.push('/results')

    } catch (error) {
      console.error(error)
      toast({
        title: "Analysis Failed",
        description: "AI analysis encountered an error. Please try again.",
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
                      description="Simulated majority voting across VGG16, ResNet50, and InceptionV3 architectures."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Medical Image Proxy" 
                      description="Using Gemini 2.5 Flash as a high-precision diagnostic interpreter."
                      active={true}
                    />
                    <ProtocolItem 
                      title="Cloud Architecture" 
                      description="Serverless GPU-accelerated inference via Google Cloud."
                      active={true}
                    />
                  </CardContent>
                </Card>

                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4">
                   <Info className="w-6 h-6 text-primary shrink-0" />
                   <div>
                     <h4 className="font-bold text-primary text-sm">System Note</h4>
                     <p className="text-[11px] text-primary/80 mt-1 leading-relaxed">
                       This prototype uses Genkit + Gemini to simulate your custom .h5 model ensemble. It interprets the visual data to provide a realistic demonstration of model voting.
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
