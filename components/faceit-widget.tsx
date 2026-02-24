"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"

interface FaceitData {
    nickname: string
    elo: number
    level: number
    avatar: string
}

export function FaceitWidget() {
    const [data, setData] = useState<FaceitData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/faceit')
                if (!res.ok) throw new Error('Failed')
                const json = await res.json()
                setData(json)
            } catch (e) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (error) return null
    if (loading) return <div className="mt-2 h-[40px] w-[200px] animate-pulse bg-muted/20 rounded-md" />

    if (!data) return null

    return (
        <a
            href={`https://www.faceit.com/en/players/${data.nickname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group w-fit"
        >
            {/* Level Icon / Circle */}
            < div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2
                ${data.level >= 10 ? 'border-red-500 text-red-500' :
                    data.level >= 8 ? 'border-orange-500 text-orange-500' :
                        'border-yellow-500 text-yellow-500'}
            `}>
                {data.level}
            </div >

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {data.elo}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">ELO</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Faceit Level {data.level}</span>
                </div>
            </div>
        </a >
    )
}
