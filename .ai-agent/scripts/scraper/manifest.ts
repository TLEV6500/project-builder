import { ScraperTarget } from "./types";

/**
 * The master list of documentation targets for your monorepo.
 * You can add any library here. If it's a dense file, it splits.
 * If it's a link index menu, our hybrid parser crawls it automatically.
 */
export const DOCUMENTATION_MANIFEST: ScraperTarget[] = [
    {
        name: "bun",
        sourceUrl: "https://bun.sh" // Dense Markdown file
    },
    {
        name: "elysia",
        sourceUrl: "https://elysiajs.com" // Link Index menu fallback
    },
    {
        name: "typescript",
        sourceUrl: "https://typescriptlang.org" // Standard Webpage -> Jina Router
    }
];
