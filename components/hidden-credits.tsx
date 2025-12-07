"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function HiddenCredits() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                {/* Invisible trigger in bottom-left corner */}
                <button
                    className="fixed bottom-0 left-0 w-16 h-16 bg-transparent border-0 cursor-pointer z-50 opacity-0 hover:opacity-0"
                    aria-label="Credits"
                />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Credits</DialogTitle>
                    <DialogDescription>
                        by Fanta/Teri and Bendy
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
