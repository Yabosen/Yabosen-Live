"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-screen bg-background flex items-center justify-center p-4">
                        <div className="text-center space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">
                                Something went wrong
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Please try refreshing the page
                            </p>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )
            )
        }

        return this.props.children
    }
}
