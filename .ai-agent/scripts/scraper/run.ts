import * as path from 'path';
import { initializeConfig, validateMarkdownContent, processAndWriteContent } from './utils/index';

async function runScraper() {
    const [name, rawUrl] = Bun.argv.slice(2);
    const config = initializeConfig(name, rawUrl);

    console.log(`📡 Fetching index profile from: ${config.finalFetchUrl}...`);

    try {
        const response = await fetch(config.finalFetchUrl);
        if (!response.ok) throw new Error(`Network returned code: ${response.status} for url: ${config.finalFetchUrl}`);

        const masterMarkdown = await response.text();
        validateMarkdownContent(masterMarkdown);

        // Save baseline master tracking index
        const masterPath = path.join(config.outputDir, config.masterFileName);
        Bun.write(masterPath, masterMarkdown);
        console.log(`\n✅ Saved index mapping file: .ai-agent/docs/${config.name}/${config.masterFileName}`);

        // Trigger incremental writing process
        const totalFilesSaved = await processAndWriteContent(masterMarkdown, config);

        console.log(`\n✨ Hybrid download cycle successful! Flushed ${totalFilesSaved} files inside:`);
        console.log(`👉 .ai-agent/docs/${config.name}/`);

    } catch (error) {
        console.error("❌ Critical execution failure running download pipeline:", error);
        console.error("Url: ", config.finalFetchUrl)
    }
}

runScraper();
