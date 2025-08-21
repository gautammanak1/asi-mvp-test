"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useChat } from "@/contexts/chat-context"
import {
  PlusIcon,
  MessageSquareIcon,
  SettingsIcon,
  ClockIcon,
  TrashIcon,
  LayoutDashboardIcon,
  MoreVerticalIcon,
  PinIcon,
  Edit3Icon,
  ArrowRightCircleIcon,
} from "lucide-react"
import { Dialog as SidePanel, DialogContent as SidePanelContent, DialogHeader as SidePanelHeader, DialogTitle as SidePanelTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { StudyPlanner } from "@/components/study-planner"

const sidebarDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
})

export function Sidebar() {
  const {
    chatHistory,
    createNewChat,
    loadChat,
    deleteChat,
    currentChatId,
    setSidebarOpen,
    dashboardView,
    setDashboardView,
    renameChat,
    pinChat,
  } = useChat()
  const [showStudyPlanner, setShowStudyPlanner] = useState(false)
  const [activePanelChatId, setActivePanelChatId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState<string>("")
  const chatsViewportRef = useRef<HTMLDivElement | null>(null)

  const scrollByAmount = (delta: number) => {
    const el = chatsViewportRef.current
    if (el) {
      el.scrollBy({ top: delta, behavior: "smooth" })
    }
  }

  return (
    <>
      <div
        className="flex h-full w-full flex-col custom-scrollbar"
        style={{
          backgroundColor: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <div
          className="flex items-center justify-between p-3 sm:p-4"
          style={{
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse flex-shrink-0"
                style={{
                  backgroundColor: "var(--sidebar-primary)",
                }}
              ></div>
              <span className="asi-logo text-sm sm:text-base truncate" style={{ color: "var(--sidebar-foreground)" }}>
                ASIMOV
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-7 w-7 p-0">
              <span className="sr-only">Close sidebar</span>×
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-2">
          <Button
            onClick={createNewChat}
            className="new-chat-btn w-full justify-start gap-2 h-10 sm:h-11 text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">New Chat</span>
          </Button>
        </div>

        <div className="flex-1 px-3 sm:px-4 min-h-0">
          <h2 className="text-sm font-medium mb-3" style={{ color: "var(--sidebar-foreground)" }}>
            Recent Chats
          </h2>
          <div className="flex items-center justify-end gap-1 mb-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => scrollByAmount(-200)}>
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => scrollByAmount(200)}>
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-full custom-scrollbar" viewportRef={chatsViewportRef}>
            <div className="space-y-1 sm:space-y-2">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12" style={{ color: "var(--sidebar-foreground)" }}>
                  <MessageSquareIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="text-xs opacity-70">Start chatting to see your history</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="group relative">
                    <div
                      className={`conversation-item smooth-transition ${currentChatId === chat.id ? "active" : ""} p-2 sm:p-3`}
                      onClick={() => {
                        loadChat(chat.id)
                        // Close sidebar on mobile after selecting chat
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false)
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MessageSquareIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 opacity-60 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs opacity-70 message-time">{sidebarDateFormatter.format(chat.lastMessage)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Quick actions: Open, Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              loadChat(chat.id)
                              if (window.innerWidth < 1024) setSidebarOpen(false)
                            }}
                            aria-label="Open chat"
                            title="Open chat"
                          >
                            <ArrowRightCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                              if (confirm("Delete this chat? This cannot be undone.")) {
                            deleteChat(chat.id)
                              }
                          }}
                            aria-label="Delete chat"
                            title="Delete chat"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                          {/* Three-dot menu: Open, Rename, Delete, Pin */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActivePanelChatId(chat.id)
                                setRenameDraft(chat.title)
                              }}
                              aria-label="More actions"
                              title="More actions"
                            >
                              <MoreVerticalIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="sidebar-section p-3 sm:p-4 space-y-1 sm:space-y-2">
          <Button
            onClick={() => setDashboardView(!dashboardView)}
            variant={dashboardView ? "default" : "ghost"}
            className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 rounded-lg smooth-transition text-sm"
            style={{ color: dashboardView ? "white" : "var(--sidebar-foreground)" }}
          >
            <LayoutDashboardIcon className="h-4 w-4 opacity-60 flex-shrink-0" />
            <span className="font-medium truncate">Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 rounded-lg smooth-transition text-sm"
            style={{ color: "var(--sidebar-foreground)" }}
            onClick={() => setShowStudyPlanner(true)}
          >
            <ClockIcon className="h-4 w-4 opacity-60 flex-shrink-0" />
            <span className="font-medium truncate">Study Planner</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 rounded-lg smooth-transition text-sm"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            <SettingsIcon className="h-4 w-4 opacity-60 flex-shrink-0" />
            <span className="font-medium truncate">Settings</span>
          </Button>
        </div>
      </div>

      <Dialog open={showStudyPlanner} onOpenChange={setShowStudyPlanner}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Study Planner</DialogTitle>
            <DialogDescription>Plan and track your study sessions.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <StudyPlanner onClose={() => setShowStudyPlanner(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Slide-over panel for chat actions */}
      <SidePanel open={!!activePanelChatId} onOpenChange={(open) => !open && setActivePanelChatId(null)}>
        <SidePanelContent className="fixed right-0 top-0 bottom-0 h-screen w-[90vw] sm:w-[420px] border-l" aria-describedby={undefined}>
          <SidePanelHeader>
            <SidePanelTitle>Chat Actions</SidePanelTitle>
          </SidePanelHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Edit3Icon className="h-4 w-4" /> Rename
              </label>
              <input
                className="mt-2 w-full border rounded px-3 py-2 bg-background"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (activePanelChatId && renameDraft.trim()) {
                      renameChat(activePanelChatId, renameDraft.trim())
                    }
                  }}
                >
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActivePanelChatId(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PinIcon className="h-4 w-4" />
                <span>Pin Chat</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => activePanelChatId && pinChat(activePanelChatId, true)}
                >
                  Pin
                </Button>
                <Button size="sm" variant="ghost" onClick={() => activePanelChatId && pinChat(activePanelChatId, false)}>
                  Unpin
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-destructive">
              <div className="flex items-center gap-2">
                <TrashIcon className="h-4 w-4" />
                <span>Delete Chat</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (activePanelChatId && confirm("Delete this chat? This cannot be undone.")) {
                    deleteChat(activePanelChatId)
                    setActivePanelChatId(null)
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </SidePanelContent>
      </SidePanel>
    </>
  )
}
