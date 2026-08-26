export function validateMarkdownContent(content: string): void {
    if (content.trim().startsWith('<!DOCTYPE html>') || content.includes('<html')) {
        console.error("❌ CRITICAL ERROR: Scraper captured raw HTML instead of Markdown.");
        process.exit(1);
    }
}
