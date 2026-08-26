import { CONFIGURABLE_FIELDS, defineFields, PrefixedConfigurables } from "./types"
import { RunnableConfig } from "@langchain/core/runnables";


export const CONFIGURABLE_MODEL_FIELDS = defineFields([
    CONFIGURABLE_FIELDS.MODEL,
    CONFIGURABLE_FIELDS.API_KEY,
    CONFIGURABLE_FIELDS.MODEL_PROVIDER,
    CONFIGURABLE_FIELDS.TEMPERATURE,
    CONFIGURABLE_FIELDS.BASE_URL,
    CONFIGURABLE_FIELDS.STREAMING
] as const)

export type BaseFields = typeof CONFIGURABLE_MODEL_FIELDS[number]
