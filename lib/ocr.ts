import Tesseract, { createWorker } from "tesseract.js"

export interface OCRResult {
  text: string
  confidence: number
}

class OCRProcessor {
  private worker: Tesseract.Worker | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.worker = await createWorker("eng")
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize OCR worker:", error)
      throw new Error("OCR initialization failed")
    }
  }

  async processImage(imageFile: File): Promise<OCRResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize()
    }

    if (!this.worker) {
      throw new Error("OCR worker not available")
    }

    try {
      const {
        data: { text, confidence },
      } = await this.worker.recognize(imageFile)

      return {
        text: text.trim(),
        confidence: Math.round(confidence),
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      throw new Error("Failed to extract text from image")
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

export const ocrProcessor = new OCRProcessor()

// Utility function to validate image files
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxImagePdfSize = 10 * 1024 * 1024 // 10MB
  const maxVideoSize = 50 * 1024 * 1024 // 50MB
  const isVideo = file.type.startsWith("video/")
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]

  if (!isVideo && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload a valid file (JPEG, PNG, WebP, PDF, or Video)",
    }
  }

  if ((isVideo && file.size > maxVideoSize) || (!isVideo && file.size > maxImagePdfSize)) {
    return {
      isValid: false,
      error: isVideo ? "Video size must be less than 50MB" : "File size must be less than 10MB",
    }
  }

  return { isValid: true }
}

// Utility function to create image preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// Cleanup function for image preview URLs
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}
