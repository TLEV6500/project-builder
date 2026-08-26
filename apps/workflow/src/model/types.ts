type UniversalModelField =
    | "model"
    | "modelProvider"
    | "temperature"
    | "maxTokens"
    | "timeout";

type CommonLLMField =
    | "topP"
    | "topK"
    | "frequencyPenalty"
    | "presencePenalty"
    | "streaming"
    | "stop";

type ProviderSpecificField =
    | "seed"
    | "user"
    | "logprobs"
    | "apiKey"
    | "baseUrl"
    | "candidateCount"
    | "safetySettings";

// Combine everything into a helper type
export type ConfigurableField = UniversalModelField | CommonLLMField | ProviderSpecificField;


export type ValidConfigFields<T extends readonly string[]> = {
    [K in keyof T]: T[K] extends ConfigurableField ? T[K] : never;
};


export const CONFIGURABLE_FIELDS = {
    MODEL: "model",
    MODEL_PROVIDER: "modelProvider",
    TEMPERATURE: "temperature",
    MAX_TOKENS: "maxTokens",
    TIMEOUT: "timeout",
    TOP_P: "topP",
    TOP_K: "topK",
    FREQUENCY_PENALTY: "frequencyPenalty",
    PRESENCE_PENALTY: "presencePenalty",
    STREAMING: "streaming",
    STOP: "stop",
    SEED: "seed",
    USER: "user",
    LOGPROBS: "logprobs",
    API_KEY: "apiKey",
    BASE_URL: "baseUrl",
    CANDIDATE_COUNT: "candidateCount",
    SAFETY_SETTINGS: "safetySettings"
} as const


export function defineFields<const T extends readonly string[]>(
    fields: T & ValidConfigFields<T>
): T[number][] {
    return fields as unknown as T[number][];
}


export const prefixField = (prefix: string | undefined, field: ConfigurableField) => (typeof prefix === "string" ? `${prefix}_${field}` : field)
export type PrefixField<P extends string, F extends ConfigurableField> = `${P}_${F}`


export type PrefixedConfigurables<Prefix extends string, Fields extends ConfigurableField> = {
    [K in Fields as PrefixField<Prefix, K>]?: any;
};
