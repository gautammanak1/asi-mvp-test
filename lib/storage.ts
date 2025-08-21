export interface StoredChat {
  id: string
  title: string
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: string
  }>
  lastMessage: string
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export interface StorageManager {
  saveChat: (chat: StoredChat) => void
  loadChat: (chatId: string) => StoredChat | null
  getAllChats: () => StoredChat[]
  deleteChat: (chatId: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  updatePinned: (chatId: string, pinned: boolean) => void
}

class LocalStorageManager implements StorageManager {
  private readonly STORAGE_KEY = "asi-one-chats"
  private readonly MAX_CHATS = 50

  private getStoredChats(): StoredChat[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading chats from storage:", error)
      return []
    }
  }

  private saveStoredChats(chats: StoredChat[]): void {
    try {
      // Keep only the most recent chats
      const sortedChats = chats
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, this.MAX_CHATS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedChats))
    } catch (error) {
      console.error("Error saving chats to storage:", error)
    }
  }

  saveChat(chat: StoredChat): void {
    const chats = this.getStoredChats()
    const existingIndex = chats.findIndex((c) => c.id === chat.id)

    if (existingIndex >= 0) {
      // Preserve existing pinned state if not provided
      const pinned = chat.pinned ?? chats[existingIndex].pinned
      chats[existingIndex] = { ...chat, pinned }
    } else {
      chats.push(chat)
    }

    this.saveStoredChats(chats)
  }

  loadChat(chatId: string): StoredChat | null {
    const chats = this.getStoredChats()
    return chats.find((chat) => chat.id === chatId) || null
  }

  getAllChats(): StoredChat[] {
    return this.getStoredChats().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  deleteChat(chatId: string): void {
    const chats = this.getStoredChats().filter((chat) => chat.id !== chatId)
    this.saveStoredChats(chats)
  }

  updateChatTitle(chatId: string, title: string): void {
    const chats = this.getStoredChats()
    const chatIndex = chats.findIndex((c) => c.id === chatId)

    if (chatIndex >= 0) {
      chats[chatIndex].title = title
      chats[chatIndex].updatedAt = new Date().toISOString()
      this.saveStoredChats(chats)
    }
  }

  updatePinned(chatId: string, pinned: boolean): void {
    const chats = this.getStoredChats()
    const chatIndex = chats.findIndex((c) => c.id === chatId)

    if (chatIndex >= 0) {
      chats[chatIndex].pinned = pinned
      chats[chatIndex].updatedAt = new Date().toISOString()
      this.saveStoredChats(chats)
    }
  }
}

export const storageManager: StorageManager = new LocalStorageManager()
