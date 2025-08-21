"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, XIcon, FileTextIcon } from "lucide-react"
import { validateImageFile, createImagePreview } from "@/lib/ocr"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ onImageSelect, disabled, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    const validation = validateImageFile(file)

    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    const previewUrl = createImagePreview(file)
    onImageSelect(file, previewUrl)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,video/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-image-upload
      >
        <ImageIcon className={cn("h-4 w-4 transition-colors", dragActive && "text-primary")} />
      </Button>
    </div>
  )
}

interface ImagePreviewProps {
  file: File
  previewUrl: string
  ocrProgress?: number
  ocrText?: string
  ocrConfidence?: number
  onRemove: () => void
  className?: string
}

export function ImagePreview({
  file,
  previewUrl,
  ocrProgress,
  ocrText,
  ocrConfidence,
  onRemove,
  className,
}: ImagePreviewProps) {
  return (
    <div className={cn("relative border rounded-lg p-3 bg-muted/50", className)}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt={file.name}
            className="w-16 h-16 object-cover rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={onRemove}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>

          {ocrProgress !== undefined && ocrProgress < 100 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <FileTextIcon className="h-3 w-3" />
                <span className="text-xs">Extracting text...</span>
              </div>
              <Progress value={ocrProgress} className="h-1" />
            </div>
          )}

          {ocrText && (
            <div className="mt-2 p-2 bg-background rounded border">
              <div className="flex items-center gap-1 mb-1">
                <FileTextIcon className="h-3 w-3" />
                <span className="text-xs font-medium">Extracted Text</span>
                {ocrConfidence && (
                  <span
                    className={cn(
                      "text-xs px-1 rounded",
                      ocrConfidence > 80
                        ? "text-green-600 bg-green-100"
                        : ocrConfidence > 60
                          ? "text-yellow-600 bg-yellow-100"
                          : "text-red-600 bg-red-100",
                    )}
                  >
                    {ocrConfidence}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{ocrText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
