const CACHE_NAME = "asimov-edu-v2"
const STATIC_CACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/offline.html",
]

const DYNAMIC_CACHE_URLS = ["/api/", "https://api.asi1.ai/"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("ASIMOV Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("ASIMOV Service Worker: Caching static assets")
        return cache.addAll(STATIC_CACHE_URLS.filter((url) => url !== "/offline.html"))
      })
      .then(() => {
        console.log("ASIMOV Service Worker: Installed successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("ASIMOV Service Worker: Installation failed", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("ASIMOV Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith("asimov-edu-")) {
              console.log("ASIMOV Service Worker: Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("ASIMOV Service Worker: Activated successfully")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/") || url.hostname === "api.asi1.ai") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone()

          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }

          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }

            // Return offline response for API calls
            return new Response(
              JSON.stringify({
                error: "You are offline. ASIMOV will sync your messages when you're back online.",
                offline: true,
                timestamp: new Date().toISOString(),
              }),
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: {
                  "Content-Type": "application/json",
                },
              },
            )
          })
        }),
    )
    return
  }

  // Handle static assets and pages with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache and update in background
        fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone)
              })
            }
          })
          .catch(() => {
            // Ignore network errors when updating cache
          })

        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone response for caching
          const responseClone = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
        .catch(() => {
          // Return main page for navigation requests when offline
          if (request.mode === "navigate") {
            return caches.match("/").then((cachedPage) => {
              return (
                cachedPage ||
                new Response(
                  `<!DOCTYPE html>
                <html>
                <head>
                  <title>ASIMOV - Offline</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: system-ui; text-align: center; padding: 2rem; background: #0f0f0f; color: white; }
                    .logo { color: #22c55e; font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
                    .status { color: #ef4444; margin-bottom: 1rem; }
                  </style>
                </head>
                <body>
                  <div class="logo">ASIMOV</div>
                  <div class="status">You're offline</div>
                  <p>Please check your internet connection and try again.</p>
                  <button onclick="window.location.reload()">Retry</button>
                </body>
                </html>`,
                  {
                    status: 200,
                    statusText: "OK",
                    headers: {
                      "Content-Type": "text/html",
                    },
                  },
                )
              )
            })
          }

          // Return empty response for other requests
          return new Response("", {
            status: 404,
            statusText: "Not Found",
          })
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("ASIMOV Service Worker: Background sync triggered:", event.tag)

  if (event.tag === "asimov-sync-messages") {
    event.waitUntil(syncOfflineMessages())
  }
})

// Function to sync offline messages
async function syncOfflineMessages() {
  try {
    // Get offline messages from IndexedDB
    const offlineMessages = await getOfflineMessages()

    for (const message of offlineMessages) {
      try {
        // Attempt to send message
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        })

        if (response.ok) {
          // Remove from offline storage
          await removeOfflineMessage(message.id)
          console.log("ASIMOV Service Worker: Synced offline message:", message.id)
        }
      } catch (error) {
        console.error("ASIMOV Service Worker: Failed to sync message:", error)
      }
    }
  } catch (error) {
    console.error("ASIMOV Service Worker: Background sync failed:", error)
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineMessages() {
  // This would integrate with the actual offline storage implementation
  return []
}

async function removeOfflineMessage(messageId) {
  // This would integrate with the actual offline storage implementation
  console.log("Removing offline message:", messageId)
}

// Push notifications for study reminders and updates
self.addEventListener("push", (event) => {
  console.log("ASIMOV Service Worker: Push notification received")

  if (event.data) {
    const data = event.data.json()

    event.waitUntil(
      self.registration.showNotification(data.title || "ASIMOV", {
        body: data.body || "You have a new message from ASIMOV",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "asimov-notification",
        requireInteraction: false,
        silent: false,
        actions: [
          {
            action: "open",
            title: "Open ASIMOV",
            icon: "/icon-192.png",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
        data: {
          url: data.url || "/",
          timestamp: Date.now(),
        },
      }),
    )
  }
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("ASIMOV Service Worker: Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        const url = event.notification.data?.url || "/"

        // Check if ASIMOV is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus()
            if (url !== "/") {
              client.navigate(url)
            }
            return
          }
        }

        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
    )
  }
})

// Handle app shortcuts
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

console.log("ASIMOV Service Worker: Loaded successfully")
