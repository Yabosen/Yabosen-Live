import { siteConfig } from "@/lib/config"

export function PersonalInfo() {
  return (
    <div className="space-y-3 mb-6">
      {siteConfig.personalInfo.map((info, index) => (
        <div
          key={index}
          className="bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 text-sm font-mono"
        >
          <span className="text-muted-foreground">{info.label}:</span>{" "}
          <span className="text-foreground">{info.value}</span>
        </div>
      ))}

      {/* Custom text sections */}
      {siteConfig.customText && siteConfig.customText.length > 0 && (
        <div className="mt-4 space-y-2">
          {siteConfig.customText.map((text, index) => (
            <p key={index} className="text-sm text-orange-400/80 font-light">
              {text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
