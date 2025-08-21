import type { SerperResponse } from "@/lib/serper-api"
import { ExternalLinkIcon, PlayIcon, ImageIcon } from "lucide-react"

interface WebSearchResultsProps {
  results: SerperResponse
  searchType: "search" | "videos" | "images"
  query: string
}

export function WebSearchResults({ results, searchType, query }: WebSearchResultsProps) {
  if (searchType === "videos" && results.videos) {
    return (
      <div className="my-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <PlayIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Video Results for "{query}"</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.videos.slice(0, 4).map((video, index) => (
            <a
              key={index}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-3 bg-background rounded border hover:bg-muted/50 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={video.imageUrl || "/placeholder.svg?height=60&width=80"}
                  alt={video.title}
                  className="w-20 h-15 object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{video.snippet}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{video.duration}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (searchType === "images" && results.images) {
    return (
      <div className="my-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Image Results for "{query}"</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {results.images.slice(0, 8).map((image, index) => (
            <a
              key={index}
              href={image.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-muted rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            >
              <img
                src={image.imageUrl || "/placeholder.svg?height=150&width=150"}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs line-clamp-2">{image.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (results.organic) {
    return (
      <div className="my-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <ExternalLinkIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Web Results for "{query}"</h3>
        </div>
        <div className="space-y-3">
          {results.organic.slice(0, 5).map((result, index) => (
            <a
              key={index}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-background rounded border hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium text-sm mb-1 text-primary hover:underline">{result.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{result.snippet}</p>
              <div className="text-xs text-muted-foreground">
                {new URL(result.link).hostname}
                {result.date && ` • ${result.date}`}
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return null
}
