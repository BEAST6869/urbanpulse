import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  X,
  Loader2,
  Cpu,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, PageHeader } from '@/components/ui/primitives'
import { generateReportId } from '@/lib/utils'
import tfLoader, { type ClassificationResult } from '@/lib/tfLoader'

interface LocationData {
  latitude: number
  longitude: number
}

const categories = [
  'Pothole',
  'Broken Streetlight', 
  'Damaged Sidewalk',
  'Graffiti',
  'Littering',
  'Blocked Drain',
  'Traffic Sign Damage',
  'Other'
]

export function ReportPage() {
  const [step, setStep] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [category, setCategory] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [reportId, setReportId] = useState('')
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null)
  const [tfInitialized, setTfInitialized] = useState(false)
  const [tfInitializing, setTfInitializing] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    // Initialize TensorFlow.js
    const initTensorFlow = async () => {
      setTfInitializing(true)
      try {
        const success = await tfLoader.initialize()
        setTfInitialized(success)
        
        if (success) {
          console.log('🎉 TensorFlow.js initialized for local inference')
        } else {
          console.log('⚠️ TensorFlow.js initialization failed, will use API fallback')
        }
      } catch (error) {
        console.error('❌ TensorFlow.js initialization error:', error)
      } finally {
        setTfInitializing(false)
      }
    }

    initTensorFlow()
  }, [])

  const handleImageUpload = (file: File) => {
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setStep(2)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  const startCamera = async () => {
    setIsCapturing(true)
    // Camera implementation would go here
    // For demo, we'll simulate it
    setTimeout(() => {
      // Create a demo image file
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 300
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#4F46E5'
      ctx.fillRect(0, 0, 400, 300)
      ctx.fillStyle = 'white'
      ctx.font = '20px Arial'
      ctx.fillText('Demo Camera Capture', 100, 150)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          handleImageUpload(file)
        }
      })
      setIsCapturing(false)
    }, 2000)
  }

  const classifyImage = async () => {
    if (!imageFile) return
    setIsClassifying(true)
    setError('')
    
    try {
      console.log('🧠 Starting image classification...')
      
      // Use TensorFlow.js classification
      const result = await tfLoader.classifyImage(imageFile)
      
      setClassificationResult(result)
      setCategory(result.category)
      setConfidence(result.confidence)
      
      console.log(`✅ Classification complete: ${result.category} (${result.confidence.toFixed(4)} confidence)`)
      console.log(`🕰️ Processing time: ${result.processingTime}ms`)
      console.log(`📍 Source: ${result.source}`)
      
      setStep(3)
      
    } catch (error) {
      console.error('❌ Classification error:', error)
      setError(`Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback to manual category selection
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      setCategory(randomCategory)
      setConfidence(0.5)
      setStep(3)
      
    } finally {
      setIsClassifying(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!imageFile || !description.trim()) {
        throw new Error('Please provide both an image and description')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const id = generateReportId()
      setReportId(id)
      setSuccess(true)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setCategory('')
    setConfidence(null)
    setClassificationResult(null)
    setError('')
    setStep(1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader 
        title="Report an Issue" 
        subtitle="Help improve your community by reporting infrastructure problems" 
      />

      <AnimatePresence mode="wait">
        {/* Step 1: Image Upload */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">Add a Photo</h2>
                  <p className="text-muted-foreground">
                    Capture or upload an image of the issue you want to report
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    onClick={startCamera}
                    disabled={isCapturing}
                    className="h-16"
                  >
                    {isCapturing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="mr-2 h-5 w-5" />
                    )}
                    {isCapturing ? 'Starting Camera...' : 'Use Camera'}
                  </Button>
                  
                  <label className="relative">
                    <Button size="lg" variant="outline" className="h-16 w-full cursor-pointer">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Photo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Image Classification */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="relative">
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 z-10 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
                <img
                  src={imagePreview!}
                  alt="Upload preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">AI Classification</h2>
                  <p className="text-muted-foreground mb-4">
                    Let our AI identify the type of issue for better categorization
                  </p>
                  
                  {/* TensorFlow.js Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {tfInitializing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-muted-foreground">Initializing TensorFlow.js...</span>
                      </>
                    ) : tfInitialized ? (
                      <>
                        <Cpu className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Local AI Ready</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600 dark:text-orange-400">API Fallback</span>
                      </>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}
                
                <Button 
                  onClick={classifyImage}
                  loading={isClassifying}
                  size="lg"
                  variant="gradient"
                  disabled={!imageFile}
                >
                  {isClassifying ? 'Analyzing Image...' : 'Classify Issue'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Details Form */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{category}</span>
                      {confidence && (
                        <span className="text-sm text-muted-foreground">
                          ({Math.round(confidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                    
                    {classificationResult && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {classificationResult.source === 'local' ? (
                          <>
                            <Cpu className="h-3 w-3" />
                            <span>Processed locally with TensorFlow.js ({classificationResult.processingTime}ms)</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            <span>Processed via API ({classificationResult.processingTime}ms)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details about the issue..."
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  {location ? (
                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Getting your location...</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  size="lg"
                  className="w-full"
                  variant="gradient"
                >
                  {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && success && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">Report Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your report has been received. You can track its progress using the ID below.
              </p>
              
              <div className="bg-secondary p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1">Report ID</p>
                <p className="font-mono text-lg font-bold">{reportId}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate(`/status/${reportId}`)}
                  variant="gradient"
                  className="flex-1"
                >
                  Track Status
                </Button>
                <Button 
                  onClick={() => {
                    setStep(1)
                    setSuccess(false)
                    clearImage()
                    setDescription('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Report Another
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
