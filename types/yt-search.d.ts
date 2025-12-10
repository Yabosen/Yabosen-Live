declare module 'yt-search' {
    interface VideoSearchResult {
        type: 'video'
        videoId: string
        url: string
        title: string
        description: string
        image: string
        thumbnail: string
        seconds: number
        timestamp: string
        ago: string
        views: number
        author: {
            name: string
            url: string
        }
    }

    interface SearchResult {
        all: any[]
        videos: VideoSearchResult[]
        playlists: any[]
        lists: any[]
        accounts: any[]
    }

    interface SearchOptions {
        query: string
        pageStart?: number
        pageEnd?: number
    }

    function search(query: string | SearchOptions): Promise<SearchResult>
    // Callback style support if needed, but we use promise

    export default search
}
