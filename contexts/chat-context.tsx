"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { storageManager, type StoredChat } from "@/lib/storage"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
  // Added image support to messages
  image?: {
    url: string
    name: string
    ocrText?: string
    ocrConfidence?: number
    mimeType?: string
  }
}

interface ChatContextType {
  messages: Message[]
  isLoading: boolean
  sidebarOpen: boolean
  currentChatId: string | null
  chatHistory: Array<{ id: string; title: string; lastMessage: Date }>
  dashboardView: boolean
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string
  updateMessage: (id: string, content: string) => void
  clearMessages: () => void
  setSidebarOpen: (open: boolean) => void
  setIsLoading: (loading: boolean) => void
  setDashboardView: (view: boolean) => void
  createNewChat: () => void
  loadChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  saveChatToStorage: () => void
  renameChat: (chatId: string, title: string) => void
  pinChat: (chatId: string, pinned: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; lastMessage: Date }>>([])
  const [dashboardView, setDashboardView] = useState(false)

  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const storedChats = storageManager.getAllChats()
        const historyItems = storedChats.map((chat) => ({
          id: chat.id,
          title: chat.title,
          lastMessage: new Date(chat.lastMessage),
        }))
        setChatHistory(historyItems)
      } catch (error) {
        console.error("Error loading chat history:", error)
      }
    }

    loadChatHistory()
  }, [])

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      saveChatToStorage()
    }
  }, [messages, currentChatId])

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const id =
      typeof crypto !== "undefined" && (crypto as unknown as { randomUUID?: () => string }).randomUUID
        ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return id
  }, [])

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content, isStreaming: false } : msg)))
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const createNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (currentChatId && messages.length > 0) {
      saveChatToStorage()
    }

    // Create new chat
    const newChatId = `chat_${Date.now()}`
    setCurrentChatId(newChatId)
    setMessages([])
    setDashboardView(false)
  }, [messages, currentChatId])

  const loadChat = useCallback((chatId: string) => {
    try {
      const storedChat = storageManager.loadChat(chatId)
      if (storedChat) {
        const loadedMessages: Message[] = storedChat.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(loadedMessages)
        setCurrentChatId(chatId)
        setDashboardView(false)
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }, [])

  const deleteChat = useCallback(
    (chatId: string) => {
      try {
        storageManager.deleteChat(chatId)
        setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

        // If we're deleting the current chat, clear it
        if (currentChatId === chatId) {
          setCurrentChatId(null)
          setMessages([])
        }
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
    },
    [currentChatId],
  )

  const saveChatToStorage = useCallback(() => {
    if (!currentChatId || messages.length === 0) return

    try {
      const chatTitle = messages.find((m) => m.role === "user")?.content.slice(0, 50) + "..." || "New Chat"
      const now = new Date().toISOString()

      const storedChat: StoredChat = {
        id: currentChatId,
        title: chatTitle,
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
        lastMessage: now,
        createdAt: now,
        updatedAt: now,
      }

      storageManager.saveChat(storedChat)

      // Update chat history
      setChatHistory((prev) => {
        const existing = prev.find((chat) => chat.id === currentChatId)
        if (existing) {
          return prev.map((chat) =>
            chat.id === currentChatId ? { ...chat, title: chatTitle, lastMessage: new Date(now) } : chat,
          )
        } else {
          return [
            ...prev,
            {
              id: currentChatId,
              title: chatTitle,
              lastMessage: new Date(now),
            },
          ]
        }
      })
    } catch (error) {
      console.error("Error saving chat:", error)
    }
  }, [currentChatId, messages])

  const renameChat = useCallback((chatId: string, title: string) => {
    try {
      storageManager.updateChatTitle(chatId, title)
      setChatHistory((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title, lastMessage: new Date() } : c)),
      )
    } catch (error) {
      console.error("Error renaming chat:", error)
    }
  }, [])

  const pinChat = useCallback((chatId: string, pinned: boolean) => {
    try {
      storageManager.updatePinned(chatId, pinned)
      // Note: we don't change ordering here; storage sorting remains by updatedAt.
    } catch (error) {
      console.error("Error pinning chat:", error)
    }
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sidebarOpen,
        currentChatId,
        chatHistory,
        dashboardView,
        addMessage,
        updateMessage,
        clearMessages,
        setSidebarOpen,
        setIsLoading,
        setDashboardView,
        createNewChat,
        loadChat,
        deleteChat,
        saveChatToStorage,
        renameChat,
        pinChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
