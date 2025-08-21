export interface PWACapabilities {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  hasServiceWorker: boolean
}

export function getPWACapabilities(): PWACapabilities {
  const isInstalled =
    window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

  const isOnline = navigator.onLine

  const hasServiceWorker = "serviceWorker" in navigator

  // Check if beforeinstallprompt event is supported
  const isInstallable = "BeforeInstallPromptEvent" in window || "onbeforeinstallprompt" in window

  return {
    isInstallable,
    isInstalled,
    isOnline,
    hasServiceWorker,
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.log("ASIMOV: Service workers not supported")
    return null
  }

  if (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("preview")) {
    console.log("ASIMOV: Skipping service worker registration in preview environment")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    console.log("ASIMOV: Service worker registered successfully:", registration)

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log("ASIMOV: New service worker version available")

            // Show update notification
            if (confirm("ASIMOV has been updated! Reload to get the latest features?")) {
              newWorker.postMessage({ type: "SKIP_WAITING" })
              window.location.reload()
            }
          }
        })
      }
    })

    // Handle service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATE_READY") {
        window.location.reload()
      }
    })

    return registration
  } catch (error) {
    console.error("ASIMOV: Service worker registration failed:", error)
    return null
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(false)
  }

  return navigator.serviceWorker
    .getRegistration()
    .then((registration) => {
      if (registration) {
        console.log("ASIMOV: Unregistering service worker")
        return registration.unregister()
      }
      return false
    })
    .catch((error) => {
      console.error("ASIMOV: Service worker unregistration failed:", error)
      return false
    })
}

// Enhanced offline storage utilities for ASIMOV
export class OfflineStorage {
  private dbName = "asimov-offline-storage"
  private version = 2
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("ASIMOV: Failed to open IndexedDB:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("ASIMOV: IndexedDB initialized successfully")
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for offline functionality
        if (!db.objectStoreNames.contains("messages")) {
          const messageStore = db.createObjectStore("messages", { keyPath: "id" })
          messageStore.createIndex("chatId", "chatId", { unique: false })
          messageStore.createIndex("timestamp", "timestamp", { unique: false })
          messageStore.createIndex("offline", "offline", { unique: false })
        }

        if (!db.objectStoreNames.contains("chats")) {
          const chatStore = db.createObjectStore("chats", { keyPath: "id" })
          chatStore.createIndex("lastMessage", "lastMessage", { unique: false })
        }

        if (!db.objectStoreNames.contains("studyPlans")) {
          const studyStore = db.createObjectStore("studyPlans", { keyPath: "id" })
          studyStore.createIndex("createdAt", "createdAt", { unique: false })
        }

        if (!db.objectStoreNames.contains("userPreferences")) {
          db.createObjectStore("userPreferences", { keyPath: "key" })
        }

        console.log("ASIMOV: IndexedDB schema updated")
      }
    })
  }

  async saveOfflineMessage(message: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["messages"], "readwrite")
      const store = transaction.objectStore("messages")

      const offlineMessage = {
        ...message,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        offline: true,
        timestamp: new Date().toISOString(),
        syncStatus: "pending",
      }

      const request = store.add(offlineMessage)

      request.onsuccess = () => {
        console.log("ASIMOV: Offline message saved:", offlineMessage.id)
        resolve()
      }
      request.onerror = () => {
        console.error("ASIMOV: Failed to save offline message:", request.error)
        reject(request.error)
      }
    })
  }

  async getOfflineMessages(chatId?: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["messages"], "readonly")
      const store = transaction.objectStore("messages")

      let request: IDBRequest
      if (chatId) {
        const index = store.index("chatId")
        request = index.getAll(chatId)
      } else {
        const index = store.index("offline")
        request = index.getAll(true)
      }

      request.onsuccess = () => {
        const messages = request.result.filter((msg: any) => msg.syncStatus === "pending")
        resolve(messages)
      }
      request.onerror = () => {
        console.error("ASIMOV: Failed to get offline messages:", request.error)
        reject(request.error)
      }
    })
  }

  async markMessageSynced(messageId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["messages"], "readwrite")
      const store = transaction.objectStore("messages")

      const getRequest = store.get(messageId)
      getRequest.onsuccess = () => {
        const message = getRequest.result
        if (message) {
          message.syncStatus = "synced"
          message.syncedAt = new Date().toISOString()

          const updateRequest = store.put(message)
          updateRequest.onsuccess = () => {
            console.log("ASIMOV: Message marked as synced:", messageId)
            resolve()
          }
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve() // Message not found, consider it synced
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async saveUserPreference(key: string, value: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userPreferences"], "readwrite")
      const store = transaction.objectStore("userPreferences")

      const request = store.put({ key, value, updatedAt: new Date().toISOString() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getUserPreference(key: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["userPreferences"], "readonly")
      const store = transaction.objectStore("userPreferences")

      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearOfflineData(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["messages", "chats", "studyPlans"], "readwrite")

      const clearPromises = [
        transaction.objectStore("messages").clear(),
        transaction.objectStore("chats").clear(),
        transaction.objectStore("studyPlans").clear(),
      ]

      transaction.oncomplete = () => {
        console.log("ASIMOV: Offline data cleared")
        resolve()
      }
      transaction.onerror = () => {
        console.error("ASIMOV: Failed to clear offline data:", transaction.error)
        reject(transaction.error)
      }
    })
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      }
    }
    return { used: 0, quota: 0 }
  }
}

export const offlineStorage = new OfflineStorage()

// Background sync utilities
export function requestBackgroundSync(tag: string): void {
  if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.sync.register(tag)
      })
      .catch((error) => {
        console.error("ASIMOV: Background sync registration failed:", error)
      })
  }
}

// Network status utilities
export function addNetworkStatusListener(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}
