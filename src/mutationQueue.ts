type Mutation = () => Promise<void>

let queue: Mutation[] = []
let running = false

async function flush() {
    if (running) return
    running = true
    while (queue.length > 0) {
        const next = queue.shift()!
        await next()
    }
    running = false
}

export function enqueue(fn: Mutation) {
    queue.push(fn)
    flush()
}
