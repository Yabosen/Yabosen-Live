import type { Viewport } from "next"
import { Win98Desktop } from "@/components/win98/desktop"

export const viewport: Viewport = {
  themeColor: "#008080",
}

export default function Home() {
  return <Win98Desktop />
}
