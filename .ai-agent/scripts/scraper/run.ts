import * as fs from 'fs';
import * as path from 'path';
import { initializeConfig, validateMarkdownContent, processMarkdownContent } from './utils';

async function runScraper() {
    // Grab CLI arguments directly from Bun runtime execution stack
    const [name, rawUrl] = Bun.argv.slice(2);
    const config = initializeConfig(name, rawUrl);

    // Ensure target isolated directory paths are built
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }

    console.log(`📡 Fetching profile from: ${config.finalFetchUrl}...`);

    try {
        const response = await fetch(config.finalFetchUrl);
        if (!response.ok) throw new Error(`Network returned code: ${response.status}`);

        const masterMarkdown = await response.text();

        // Trigger our text structure guardrail check
        validateMarkdownContent(masterMarkdown);

        // Save the holistic master source record
        const masterPath = path.join(config.outputDir, config.masterFileName);
        fs.writeFileSync(masterPath, masterMarkdown, 'utf-8');
        console.log(`\n✅ Saved master file: .ai-agent/docs/${config.name}/${config.masterFileName}`);

        console.log("✂️ Commencing module segmentation logic...");

        // Transform and segment markdown by heading categories
        const segments = await processMarkdownContent(masterMarkdown, config.name);

        for (const segment of segments) {
            const segmentPath = path.join(config.outputDir, segment.filename);
            fs.writeFileSync(segmentPath, segment.content, 'utf-8');
        }

        console.log(`\n✨ All steps completed successfully! Generated ${segments.length} files inside:`);
        console.log(`👉 .ai-agent/docs/${config.name}/`);

    } catch (error) {
        console.error("❌ Critical execution failure running download pipeline:", error);
    }
}

runScraper();
