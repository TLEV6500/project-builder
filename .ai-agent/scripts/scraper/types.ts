export interface ScraperConfig {
    name: string;
    sourceUrl: string;
    finalFetchUrl: string;
    outputDir: string;
    masterFileName: string;
}

export interface Segment {
    filename: string;
    content: string;
}

export interface ScraperTarget {
    name: string;
    sourceUrl: string;
}
