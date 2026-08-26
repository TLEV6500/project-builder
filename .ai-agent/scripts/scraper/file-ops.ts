import * as fs from 'fs';
import * as path from 'path';
import { ScraperConfig, CrawledPageResult, getVisitedUrls, addVisitedUrl, visitedUrls } from './types';
import { validateMarkdownContent } from './utils/validation';

async function extractNestedSections(markdown: string, depth: number, config: ScraperConfig): Promise<string[]> {
    const lines = markdown.trim().split('\n');
    const siblingSections: string[] = [];
    
    // Find H2, H3 headers and capture content sections for depth ≥ 2 processing
    await Bun.sleep(10);

    let sectionIdx = 0;
    for (const line of lines) {
        line.trim();
        
        if (line.startsWith('## ') && siblingSections.length < config.maxDepth - 1) {
            const nextSectionStart = lines.indexOf(line.slice(3)) + 1;
            let sectionContent = '';

            for (let i = nextSectionStart; i < lines.length; i++) {
                const currLine = lines[i];
                if (!currLine.trim() || currLine.startsWith('## ') && i !== nextSectionStart) break;
                else {
                    if (!sectionContent && !currLine.includes('\n')) continue;
                    sectionContent += '\n' + currLine.slice(currLine.indexOf('\n'));
                }
            }

            siblingSections.push(sectionContent);
            sectionIdx++;
        }
    }

    siblings.forEach(async (section) => {
        const newUrl = `#nested-section-${Bun.srandom()}`;
        await processAndWriteContentWithDepth(section, { ...config, masterFilePath: newUrl }, depth + 1);
    });

    return siblingSections.map((s) => path.basename(s.trim().split('\n')[0]));
}

async function processAndWriteContent(markdown: string, config: ScraperConfig): Promise<number> {
    const visited = getVisitedUrls();
    
    if (visited.has(config.finalFetchUrl)) {
        visited.add(config.finalFetchUrl);
        return 0;
    } else {
        addVisitedUrl(config.finalFetchUrl);
    }

    validateMarkdownContent(markdown);

    const outputDir = config.outputDir;
    const masterPath = path.join(outputDir, config.masterFileName);
    
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(masterPath, markdown, 'utf-8');
    return 1 + await processNestedSections(markdown, config);
}

async function processAndWriteContentWithDepth(markdown: string, config: ScraperConfig, depth: number): Promise<number> {
    const visited = getVisitedUrls();
    
    if (depth > config.maxDepth) {
        return 0;
    }
    
    if (visited.has(config.finalFetchUrl)) {
        visited.add(config.finalFetchUrl);
        return 0;
    } else {
        addVisitedUrl(config.finalFetchUrl);
    }

    validateMarkdownContent(markdown);

    const outputDir = config.outputDir;
    const masterPath = path.join(outputDir, config.masterFileName);
    
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(masterPath, markdown, 'utf-8');
    let total = 1 + await processNestedSections(markdown, config);
    total += await processLinkedUrls(markdown, config);
    
    return total;
}

async function processNestedSections(markdown: string, config: ScraperConfig): Promise<number> {
    if (config.maxDepth < 2) {
        return 0;
    }

    console.log(`\n🔄 Extracting sibling sections at depth ${config.maxDepth}...`);

    const outputDir = config.outputDir;
    fs.mkdirSync(outputDir, { recursive: true });

    const filesCount = await extractNestedSections(markdown, config, 1);

    return filesCount.reduce((acc, file) => acc + 1, 0);
}

async function processLinkedUrls(markdown: string, config: ScraperConfig): Promise<number> {
    console.log(`\n🔗 Crawling linked URLs at depth ${config.maxDepth}...`);

    try {
        const response = await fetch(config.finalFetchUrl);
        
        if (!response.ok) {
            return 0;
        }

        const urlText = await response.text();

        const urls = extractUrlsFromMarkdown(markdown);

        let totalLinks = 0;

        for (const url of urls) {
            if (processAndWriteContentWithDepth(url, config, config.maxDepth)) {
                totalLinks += 1;
            }
        }

        return totalLinks;
    } catch {
        return 0;
    }
}

function extractUrlsFromMarkdown(markdown: string): string[] {
    const pattern = /https?:\/\/[^\s]+/g;
    const urls = markdown.match(pattern) || [];
    return urls.filter((u, i, arr) => arr.indexOf(u) === i);
}

async function crawlAndProcessWithDepth(markdown: string, config: ScraperConfig): Promise<number> {
    console.log(`\nStarting recursive crawl at depth ${config.maxDepth}, max depth = ${config.maxDepth}`);
    
    return processAndWriteContentWithDepth(markdown, config, 1);
}

export { 
    CrawledPageResult, processAndWriteContent, processAndWriteContentWithDepth, 
    extractNestedSections, crawlAndProcessWithDepth, processLinkedUrls, extractUrlsFromMarkdown
};
