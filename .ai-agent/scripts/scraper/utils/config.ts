import * as path from 'path';
import { ScraperConfig } from '../types';

export function initializeConfig(name: string, rawUrl: string): ScraperConfig {
    if (!name || !rawUrl) {
        console.error("❌ Usage: bun run scraper/run.ts <name> <sourceUrl>");
        process.exit(1);
    }

    const depthArg = Bun.argv.includes('--depth') ? parseInt(Bun.argv.find(arg => arg === '--depth')?.slice(6) || '1', 10) : undefined;
    if (typeof depthArg === "number" && depthArg < 1) {
        console.error("❌ Invalid depth parameter. Must be >= 1.");
        process.exit(1);
    }
    const maxDepth = depthArg || 1;

    let finalFetchUrl = rawUrl;
    let isOnlineFile = rawUrl.startsWith('http');

    if (isOnlineFile && !rawUrl.includes('jina.ai')) {
        console.log(`ℹ️ Standard webpage detected. Routing via Jina Reader...`);
        finalFetchUrl = `https://r.jina.ai/${rawUrl}`;
    }

    console.log(`📋 Maximum recursion depth: ${maxDepth}`);

    return {
        name,
        sourceUrl: rawUrl,
        finalFetchUrl,
        outputDir: path.join(process.cwd(), ".ai-agent", "docs", name),
        masterFileName: `${name}-index.md`,
        maxDepth
    };
}

export default initializeConfig;
