import type React from "react"
import { ExternalLink } from "lucide-react"

interface LinkCardProps {
    name: string
    url: string
    icon: React.ReactNode
    description?: string
    className?: string
}

export function LinkCard({ name, url, icon, description, className = "" }: LinkCardProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
        group relative flex flex-col items-center justify-center
        bg-card/80 backdrop-blur-sm border border-border/50
        rounded-lg p-4 min-h-[100px]
        transition-all duration-300 ease-out
        hover:bg-primary/10 hover:border-primary/50
        hover:scale-105 hover:shadow-lg hover:shadow-primary/20
        ${className}
      `}
        >
            {/* Icon */}
            <div className="text-foreground/80 group-hover:text-primary transition-colors mb-2">
                {icon}
            </div>

            {/* Name */}
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-center">
                {name}
            </span>

            {/* Optional description */}
            {description && (
                <span className="text-xs text-muted-foreground mt-1 text-center truncate max-w-full">
                    {description}
                </span>
            )}

            {/* Hover indicator */}
            <ExternalLink className="absolute top-2 right-2 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </a>
    )
}
