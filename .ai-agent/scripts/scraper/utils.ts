import * as path from 'path';
import type { ScraperConfig, Segment } from './types';

export function initializeConfig(name: string, rawUrl: string): ScraperConfig {
    if (!name || !rawUrl) {
        console.error("❌ Usage: bun run scraper/run.ts <name> <sourceUrl>");
        process.exit(1);
    }

    const isRawTextOrXml = rawUrl.endsWith('.txt') || rawUrl.endsWith('.xml') || rawUrl.includes('llms');
    let finalFetchUrl = rawUrl;

    if (!isRawTextOrXml) {
        console.log(`ℹ️ Standard webpage detected. Routing via Jina Reader...`);
        finalFetchUrl = `https://r.jina.ai/${rawUrl}`;
    }

    return {
        name,
        sourceUrl: rawUrl,
        finalFetchUrl,
        outputDir: path.join(process.cwd(), ".ai-agent", "docs", name),
        masterFileName: `${name}-index.md`
    };
}

export function validateMarkdownContent(content: string): void {
    if (content.trim().startsWith('<!DOCTYPE html>') || content.includes('<html')) {
        console.error("❌ CRITICAL ERROR: Scraper captured raw HTML instead of Markdown.");
        process.exit(1);
    }
}

/**
 * HYBRID PROCESSOR: Segments dense markdown or recursively crawls markdown link indexes.
 */
export async function processMarkdownContent(masterMarkdown: string, name: string): Promise<Segment[]> {
    const segments: Segment[] = [];

    // Rule Check: If it has plenty of structural content headings, use your original fast-slicer
    if ((masterMarkdown.match(/^##\s+/gm) || []).length > 2) {
        console.log("✂️ Dense content file identified. Running heading segmentation...");
        const sections = masterMarkdown.split(/(?=^##?\s+)/m);
        let segmentCount = 0;

        for (const section of sections) {
            if (!section.trim()) continue;
            const titleMatch = section.match(/^##?\s+([^\n]+)/m);
            let filename = `docs-segment-${String(++segmentCount).padStart(2, '0')}.md`;

            if (titleMatch && titleMatch[1]) {
                const cleanTitle = titleMatch[1].toLowerCase().replace(/[^a-z0-9]/ig, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                if (cleanTitle) filename = `docs-${cleanTitle}.md`;
            }
            segments.push({ filename, content: section });
        }
        return segments;
    }

    // Fallback: If it's just a link list index, parse and crawl the sub-pages
    console.log("🔗 Link Index menu identified. Commencing sub-page documentation crawl...");

    // Regex to match standard markdown links: [Title](URL)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;
    const discoveredLinks: { title: string, url: string }[] = [];

    while ((match = linkRegex.exec(masterMarkdown)) !== null) {
        discoveredLinks.push({ title: match[1], url: match[2] });
    }

    console.log(`📚 Discovered ${discoveredLinks.length} documentation reference guides to download.`);

    for (const link of discoveredLinks) {
        const cleanTitle = link.title.toLowerCase().replace(/[^a-z0-9]/ig, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const filename = `docs-${cleanTitle}.md`;

        // Route each sub-page URL through Jina Reader to get its actual full markdown content
        const targetUrl = `https://r.jina.ai/${link.url}`;
        console.log(`📥 Crawling: ${link.title} -> ${targetUrl}`);

        try {
            const response = await fetch(targetUrl);
            if (!response.ok) {
                console.warn(`⚠️ Skipped ${link.title}: Status ${response.status}`);
                continue;
            }
            const pageMarkdown = await response.text();
            segments.push({ filename, content: `# ${link.title}\n\nSource: ${link.url}\n\n${pageMarkdown}` });

            // Mandatory 200ms delay to respect free-tier API rate ceilings and avoid getting blocked
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
            console.error(`❌ Failed downloading sub-page ${link.title}:`, err);
        }
    }

    return segments;
}
