"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChat } from "@/contexts/chat-context"
import { sendMessageToASI } from "@/lib/asi-api"
import { ocrProcessor, cleanupImagePreview } from "@/lib/ocr"
import { offlineStorage } from "@/lib/pwa-utils"
import { searchWeb, shouldSearchWeb, type SerperResponse } from "@/lib/serper-api"
import { ImageUpload } from "@/components/image-upload"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { QuickActions } from "@/components/quick-actions"
import { MenuIcon, SendIcon, WifiOffIcon, Trash2Icon, PlusIcon, FileTextIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
})

export function ChatInterface() {
  const {
    messages,
    addMessage,
    updateMessage,
    isLoading,
    setIsLoading,
    setSidebarOpen,
    currentChatId,
    createNewChat,
    clearMessages,
    deleteChat,
  } = useChat()
  const [input, setInput] = useState("")
  const [responseMode, setResponseMode] = useState("best")
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<{
    file: File
    previewUrl: string
    ocrProgress?: number
    ocrText?: string
    ocrConfidence?: number
  } | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [, setSearchResults] = useState<{
    results: SerperResponse
    searchType: "search" | "videos" | "images"
    query: string
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom()
    }
  }, [isStreaming, messages])

  useEffect(() => {
    const updateOfflineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    updateOfflineStatus()
    window.addEventListener("online", updateOfflineStatus)
    window.addEventListener("offline", updateOfflineStatus)

    return () => {
      window.removeEventListener("online", updateOfflineStatus)
      window.removeEventListener("offline", updateOfflineStatus)
    }
  }, [])

  const handleQuickAction = (actionId: string, prompt: string) => {
    if (actionId === "analyze-image") {
      // Focus on image upload
      const imageUploadButton = document.querySelector("[data-image-upload]") as HTMLButtonElement
      imageUploadButton?.click()
    } else {
      setInput(prompt)
      textareaRef.current?.focus()
    }
  }

  const handleClearChat = () => {
    if (currentChatId) {
      if (confirm("Delete this chat? This cannot be undone.")) {
        deleteChat(currentChatId)
      }
    } else {
      clearMessages()
    }
  }

  const handleNewChat = () => {
    createNewChat()
  }

  const handleImageSelect = async (file: File, previewUrl: string) => {
    setUploadedImage({
      file,
      previewUrl,
      ocrProgress: 0,
    })

    const isPdf = file.type === "application/pdf"
    const isVideo = file.type.startsWith("video/")

    if (isPdf || isVideo) {
      // Skip OCR for PDFs and videos for now; just attach the file
      setUploadedImage((prev) =>
        prev
          ? {
              ...prev,
              ocrProgress: undefined,
            }
          : null,
      )
      return
    }

    setIsProcessingOCR(true)

    try {
      const progressInterval = setInterval(() => {
        setUploadedImage((prev) =>
          prev
            ? {
                ...prev,
                ocrProgress: Math.min((prev.ocrProgress || 0) + 10, 90),
              }
            : null,
        )
      }, 200)

      const result = await ocrProcessor.processImage(file)

      clearInterval(progressInterval)

      setUploadedImage((prev) =>
        prev
          ? {
              ...prev,
              ocrProgress: 100,
              ocrText: result.text,
              ocrConfidence: result.confidence,
            }
          : null,
      )

      if (result.confidence > 70 && result.text.trim()) {
        setInput(`Please solve this problem step by step: ${result.text}`)
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      setUploadedImage((prev) =>
        prev
          ? {
              ...prev,
              ocrProgress: 100,
              ocrText: "Failed to extract text from image",
            }
          : null,
      )
    } finally {
      setIsProcessingOCR(false)
    }
  }


  const getResponseModePrompt = (mode: string) => {
    switch (mode) {
      case "best":
        return (
          "Format your answer with: \n" +
          "- A concise H2 title.\n" +
          "- A 'Quick Facts' 2-column table with key fields.\n" +
          "- Clear sections with H3 headings (What/Why/How, Key Details, Steps, Tips).\n" +
          "- Bulleted lists; keep paragraphs short.\n" +
          "- An FAQ (3-5 Q&A).\n" +
          "- Proper links (use markdown).\n" +
          "Avoid filler; be precise and skimmable."
        )
      case "concise":
        return "Please provide a concise, direct answer. Keep it brief and to the point."
      case "step-by-step":
        return "Please provide a detailed step-by-step explanation with clear numbered steps, examples, and reasoning for each step."
      case "detailed":
      default:
        return "Please provide a comprehensive and detailed explanation."
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !uploadedImage) || isLoading) return

    const userMessage = input.trim()
    const imageData = uploadedImage

    setInput("")
    setUploadedImage(null)
    setIsLoading(true)
    setIsStreaming(true)
    setSearchResults(null)

    if (!currentChatId) {
      createNewChat()
    }

    const userMessageObj = {
      role: "user" as const,
      content: userMessage,
      image: imageData
        ? {
            url: imageData.previewUrl,
            name: imageData.file.name,
            ocrText: imageData.ocrText,
            ocrConfidence: imageData.ocrConfidence,
            mimeType: imageData.file.type,
          }
        : undefined,
    }

    const userMessageId = addMessage(userMessageObj)

    const webSearchCheck = shouldSearchWeb(userMessage)
    let webSearchResults: SerperResponse | null = null

    if (webSearchCheck.shouldSearch && !isOffline) {
      try {
        webSearchResults = await searchWeb(webSearchCheck.query, webSearchCheck.searchType)
        setSearchResults({
          results: webSearchResults,
          searchType: webSearchCheck.searchType,
          query: webSearchCheck.query,
        })
      } catch (error) {
        console.error("Web search failed:", error)
      }
    }

    let enhancedMessage = `${getResponseModePrompt(responseMode)}\n\nUser question: ${userMessage}`

    if (imageData?.ocrText) {
      enhancedMessage += `\n\nImage content extracted: "${imageData.ocrText}"`
    }

    if (webSearchResults) {
      const searchContext =
        webSearchCheck.searchType === "videos" && webSearchResults.videos
          ? `\n\nRelevant videos found:\n${webSearchResults.videos
              .slice(0, 3)
              .map((v) => `- ${v.title}: ${v.link}`)
              .join("\n")}`
          : webSearchCheck.searchType === "images" && webSearchResults.images
            ? `\n\nRelevant images found:\n${webSearchResults.images
                .slice(0, 3)
                .map((i) => `- ${i.title}: ${i.link}`)
                .join("\n")}`
            : webSearchResults.organic
              ? `\n\nRelevant web results:\n${webSearchResults.organic
                  .slice(0, 3)
                  .map((r) => `- ${r.title}: ${r.snippet}`)
                  .join("\n")}`
              : ""

      enhancedMessage += searchContext
    }

    const assistantMessageId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    })

    try {
      if (isOffline) {
        await offlineStorage.saveOfflineMessage({
          ...userMessageObj,
          chatId: currentChatId,
        })

        updateMessage(
          assistantMessageId,
          "You're currently offline. Your message has been saved and will be sent when you're back online. In the meantime, I can help with basic questions using cached information.",
        )
      } else {
        let streamedContent = ""
        await sendMessageToASI(
          [
            ...messages,
            {
              id: userMessageId,
              role: "user",
              content: enhancedMessage,
              timestamp: new Date(),
            },
          ],
          (chunk) => {
            streamedContent += chunk
            updateMessage(assistantMessageId, streamedContent)
          },
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)

      if (!navigator.onLine) {
        updateMessage(
          assistantMessageId,
          "You appear to be offline. Please check your internet connection and try again.",
        )
      } else {
        updateMessage(assistantMessageId, "Sorry, I encountered an error. Please try again.")
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      if (imageData) {
        cleanupImagePreview(imageData.previewUrl)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-foreground text-base sm:text-lg truncate">ASIMOV</h1>
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            </div>
            <div className="text-xs text-muted-foreground hidden xs:block">powered by fetch.ai</div>
          </div>
          {isOffline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
              <WifiOffIcon className="h-3 w-3" />
              <span className="hidden xs:inline">Offline</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleNewChat} className="h-9 w-9 p-0">
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="sr-only">Clear chat</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scroll-smooth">
        <div className="space-y-3 sm:space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-6 sm:py-12 px-2">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-semibold mb-2 sm:mb-4">What can I help you with?</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-4 sm:mb-8 text-sm">
                  Ask anything to ASIMOV
                </p>
                <QuickActions onActionClick={handleQuickAction} />
              </div>
            </div>
          )}

          {messages.map((message) => {
            return (
              <div key={message.id} className="space-y-2">
                <div
                  className={cn(
                    "flex gap-2 sm:gap-3 chat-message",
                    message.role === "user"
                      ? "ml-auto flex-row-reverse max-w-[85%] sm:max-w-[80%]"
                      : "mr-auto max-w-[90%] sm:max-w-[85%]",
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground text-background",
                    )}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <div
                    className={cn(
                      "flex-1 p-3 sm:p-4 rounded-2xl space-y-2 text-sm sm:text-base",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md",
                    )}
                  >
                    {message.role === "user" && message.image && (
                      <div className="mb-2">
                        {message.image.mimeType?.startsWith("video/") ? (
                          <video
                            src={message.image.url}
                            controls
                            preload="metadata"
                            className="max-w-full sm:max-w-xs rounded border"
                          />
                        ) : message.image.mimeType === "application/pdf" ? (
                          <a
                            href={message.image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-background text-foreground text-xs"
                          >
                            <FileTextIcon className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">{message.image.name}</span>
                            <span className="text-muted-foreground">(PDF)</span>
                          </a>
                        ) : (
                          <img
                            src={message.image.url || "/placeholder.svg"}
                            alt={message.image.name}
                            className="max-w-full sm:max-w-xs rounded border"
                          />
                        )}
                        {message.image.ocrText && (
                          <div className="mt-1 text-xs text-primary-foreground/70">
                            Extracted text ({message.image.ocrConfidence}% confidence)
                          </div>
                        )}
                      </div>
                    )}

                    <MarkdownRenderer
                      content={message.content || (message.isStreaming ? "Thinking..." : "")}
                      isUserMessage={message.role === "user"}
                      className={message.role === "user" ? "text-primary-foreground" : ""}
                    />

                    {message.isStreaming && <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />}

                    <div
                      className={cn(
                        "text-xs",
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {timeFormatter.format(message.timestamp)}
                    </div>
                  </div>
                </div>

                {/* ... existing search results ... */}
              </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 sm:p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* ... existing upload preview ... */}

          <div className="mb-2 sm:mb-3">
            <Select value={responseMode} onValueChange={setResponseMode}>
              <SelectTrigger className="w-full sm:w-48 h-9">
                <SelectValue placeholder="Response mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="step-by-step">Step-by-Step</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-end min-w-0">
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isOffline
                    ? "You're offline. Messages will be saved and sent when you're back online..."
                    : "Ask a question, upload an image of a problem, or describe what you need help with..."
                }
                className="w-full min-h-[44px] sm:min-h-[60px] max-h-[120px] sm:max-h-[200px] resize-none pr-12 text-base chat-input"
                disabled={isLoading || isProcessingOCR}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  disabled={isLoading || isProcessingOCR || !!uploadedImage}
                  data-image-upload
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={(!input.trim() && !uploadedImage) || isLoading || isProcessingOCR}
              className="h-[44px] sm:h-[60px] px-3 sm:px-4"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="truncate text-xs">
              {isProcessingOCR
                ? "Processing image..."
                : isOffline
                  ? "Offline mode - messages will sync when online"
                  : "Press Enter to send, Shift+Enter for new line"}
            </span>
            <span className="flex-shrink-0 ml-2 text-xs">{input.length}/2000</span>
          </div>
        </form>
      </div>
    </div>
  )
}
