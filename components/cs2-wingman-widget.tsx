import Image from "next/image"

export function CS2WingmanWidget({ rank = "Master Guardian II" }: { rank?: string }) {
    return (
        <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group w-fit cursor-default">
            <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 border-blue-500 bg-blue-500/10 group-hover:scale-110 transition-transform overflow-hidden relative">
                <Image 
                    src="/mg2-icon.png" 
                    alt="Master Guardian II" 
                    fill
                    className="object-contain p-1"
                />
            </div>

            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground group-hover:text-blue-400 transition-colors">
                        {rank}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="uppercase tracking-wider">CS2 WINGMAN</span>
                </div>
            </div>
        </div>
    )
}
