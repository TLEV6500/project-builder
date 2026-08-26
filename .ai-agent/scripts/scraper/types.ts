export interface ScraperConfig {
    name: string;
    sourceUrl: string;
    finalFetchUrl: string;
    outputDir: string;
    masterFileName: string;
    maxDepth?: number; // Default 1, controls recursion depth for linked pages
}

export interface CrawledPageResult {
    url: string;
    markdownContent: string;
    savedFiles: number;
}

/**
 * Global set to track visited URLs across all depth levels
 * Prevents infinite recursion loops
 */
const visitedUrls = new Set<string>();

export function getVisitedUrls(): Set<string> {
    return visitedUrls;
}

export function addVisitedUrl(url: string): void {
    visitedUrls.add(url);
}
