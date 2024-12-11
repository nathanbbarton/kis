type BatchLimitFn = <T>(
    items: T[], // Array of items to process
    batchSize: number, // Maximum number of items to process at once
    fn: (item: T) => Promise<void> // Function to run for each item
) => Promise<void>

const batchLimit: BatchLimitFn = async (items, batchSize, fn) => {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize) // Take the next batch of items
        console.log(`Processing batch: ${i / batchSize + 1}`)

        try {
            await Promise.all(batch.map(fn))
            console.log("All batches complete")
        } catch (error) {
            console.log("from batch error: ", error)
            throw error
        }
    }
}

export default batchLimit
