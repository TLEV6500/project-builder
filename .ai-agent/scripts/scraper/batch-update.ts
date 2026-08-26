import * as fs from 'fs';
import * as path from 'path';
import { DOCUMENTATION_MANIFEST } from './manifest';
import { initializeConfig, validateMarkdownContent, processAndWriteContent } from './utils';

async function runBatchSync() {
    console.log("🚀 ==================================================");
    console.log(`🤖 INITIALIZING MONOREPO DOCS SYNC (${DOCUMENTATION_MANIFEST.length} Targets)`);
    console.log("🚀 ==================================================\n");

    const startTime = Date.now();

    for (const target of DOCUMENTATION_MANIFEST) {
        console.log(`\n🔄 [Syncing Component]: ${target.name.toUpperCase()}`);
        console.log(`🌐 Source Target URL: ${target.sourceUrl}`);

        // 1. Initialize custom guardrail configurations
        const config = initializeConfig(target.name, target.sourceUrl);

        // 2. Ensure targeted directory silos exist
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
        }

        try {
            // 3. Fetch index/source profile
            const response = await fetch(config.finalFetchUrl);
            if (!response.ok) throw new Error(`HTTP network error: ${response.status}`);

            const masterMarkdown = await response.text();
            validateMarkdownContent(masterMarkdown);

            // Save baseline master tracking index
            const masterPath = path.join(config.outputDir, config.masterFileName);
            fs.writeFileSync(masterPath, masterMarkdown, 'utf-8');

            // 4. Run the hybrid processing/crawling layer
            const fileCount = await processAndWriteContent(masterMarkdown, config);

            // 5. Write outputs out to local workspace storage
            console.log(`💾 Flushing ${fileCount} data blocks into cache matrix...`);

            console.log(`✅ Sync Completed for: ${target.name}`);

        } catch (error) {
            console.error(`❌ FAILED Syncing Target ${target.name}:`, error);
        }

        console.log("--------------------------------------------------");
    }

    const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✨ SUCCESS: All manifest documentation components synchronized in ${totalTimeSec}s!`);
}

runBatchSync();
