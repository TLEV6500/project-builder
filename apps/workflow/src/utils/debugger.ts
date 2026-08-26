const logQueue: { key: string, value: string }[] = []
const logMetrics = new Map<string, {
    currentRateLimitStrat: "time"
    time: number
} | {
    currentRateLimitStrat: "qty",
    qty: number
} | {
    currentRateLimitStrat: string,
    qty?: number,
    time?: number
}>()
let rateLimitOption: "time" | "qty" = "time"
let rateLimitFactor = 5_000

const isRateLimitTriggered = (...[title, _message]: Parameters<typeof deferLog>) => {
    const log = logMetrics.get(title)
    if (!log) return false;
    if (log.currentRateLimitStrat === "time") return Date.now() - log.time! < rateLimitFactor
    else if (log.currentRateLimitStrat === "qty") return log.qty! > rateLimitFactor
    else return true
}

function updateLogMetric(title: string) {
    let log = logMetrics.get(title)
    if (!log) {
        log = {
            currentRateLimitStrat: rateLimitOption,
        }
        logMetrics.set(title, log)
    }

    if (log.currentRateLimitStrat !== rateLimitOption) {
        log.currentRateLimitStrat = rateLimitOption
    }
    if (log.currentRateLimitStrat === "time") {
        log.time = Date.now()
    }
    else if (log.currentRateLimitStrat === "qty") {
        log.qty = (log.qty ?? 0) + 1
    }
}

export const deferLog = (title: string, message: any) => {
    if (isRateLimitTriggered(title, message)) return;
    logQueue.push({ key: title, value: JSON.stringify(message) })
    updateLogMetric(title)
}

export const printLogs = () => {
    let i = 0
    for (const { key, value } of logQueue) {
        console.log(`[${i++}] ${key}:`, value)
    }
    logQueue.length = 0
    logMetrics.clear()
}

export const findLogsByTitle = (title: string) => {
    if (!logMetrics.has(title)) return []
    return logQueue.filter(({ key }) => key === title)
}

export const getQueueSize = () => logQueue.length

export const setRateLimitStrat = (strat: typeof rateLimitOption, factor: number) => {
    rateLimitOption = strat
    rateLimitFactor = factor
}
