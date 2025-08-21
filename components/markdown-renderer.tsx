"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { useState } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
  isUserMessage?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace("language-", "") || "text"
  const code = String(children).replace(/\n$/, "")

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group mb-4">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <CheckIcon className="h-3 w-3 text-green-500" /> : <CopyIcon className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-b-lg overflow-x-auto">
        <code className={cn("text-sm font-mono", className)} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

function processContent(content: string): string {
  // Remove emojis using regex (preserve line breaks)
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  let processedContent = content.replace(emojiRegex, "")

  // Normalize line endings to \n
  processedContent = processedContent.replace(/\r\n?|\u2028|\u2029/g, "\n")

  // Trim trailing spaces on each line
  processedContent = processedContent.replace(/[ \t]+$/gm, "")

  // Limit excessive blank lines (3+ to 2)
  processedContent = processedContent.replace(/\n{3,}/g, "\n\n")

  // Enhance code block detection and formatting (preserve inner content)
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || "text"
    return `\`\`\`${language}\n${code.replace(/\n+$/,'')}\n\`\`\``
  })

  return processedContent.trim()
}

export function MarkdownRenderer({ content, className, isUserMessage = false }: MarkdownRendererProps) {
  if (isUserMessage) {
    // For user messages, render plain text without markdown processing
    return <div className={cn("whitespace-pre-wrap text-foreground", className)}>{content}</div>
  }

  const processedContent = processContent(content)

  // For AI messages, render with full markdown support
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Enhanced headings with better hierarchy
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-4 mt-6 text-foreground border-b border-border pb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mb-3 mt-5 text-foreground first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mb-2 mt-4 text-foreground first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-medium mb-2 mt-3 text-foreground first:mt-0">{children}</h4>
          ),

          // Enhanced paragraphs and text
          p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed text-sm last:mb-0">{children}</p>,

          // Enhanced lists with better spacing and styling
          ul: ({ children }) => <ul className="list-disc list-outside mb-4 space-y-1 pl-6 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside mb-4 space-y-1 pl-6 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="text-foreground text-sm leading-relaxed">{children}</li>,

          // Enhanced code blocks with copy functionality
          code: (props) => {
            const { children, className, ...rest } = props as unknown as {
              children: React.ReactNode
              className?: string
              inline?: boolean
            }
            const isInline = (props as unknown as { inline?: boolean }).inline
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground border" {...(rest as any)}>
                  {children as React.ReactNode}
                </code>
              )
            }
            return (
              <CodeBlock className={className} {...(rest as any)}>
                {children as React.ReactNode}
              </CodeBlock>
            )
          },

          // Remove default pre styling since CodeBlock handles it
          pre: ({ children }) => <>{children}</>,

          // Enhanced blockquotes for definitions and important notes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-muted-foreground mb-4 bg-muted/30 rounded-r">
              {children}
            </blockquote>
          ),

          // Enhanced text formatting
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,

          // Enhanced tables with better styling
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-border">
              <table className="min-w-full border-collapse bg-background">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-border px-4 py-3 font-semibold text-left text-sm text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-3 text-sm text-foreground">{children}</td>
          ),

          // Enhanced links with better styling
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),

          // Enhanced horizontal rules
          hr: () => <hr className="my-6 border-border" />,

          // Enhanced task lists
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return <input type="checkbox" checked={checked} readOnly className="mr-2 accent-primary" {...props} />
            }
            return <input type={type} {...props} />
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
