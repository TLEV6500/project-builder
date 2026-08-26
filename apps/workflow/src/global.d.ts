declare module "*.md" {
    const content: string;
    export default content;
}

declare module "bun" {
    interface Env {
        USING_LOCAL_MODEL: string
        LOCAL_LLM_PROVIDER: string
        LOCAL_LLM_MODEL: string
        LOCAL_LLM_API_KEY: string
    }
}
