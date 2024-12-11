// Function to match files with a glob pattern
import { statSync, readdirSync } from "fs"
import { join } from "path"
import extensionMatches  from "~/util/extensionMatches.js"

function findFiles(dir: string, extension: string): string[] {
    let results: string[] = []

    // Read the contents of the directory
    const files = readdirSync(dir)

    // Iterate through the files and directories
    for (const file of files) {
        const filePath = join(dir, file)
        const fileStat = statSync(filePath)

        // If it's a directory, recursively search within it
        if (fileStat.isDirectory()) {
            results = results.concat(findFiles(filePath, extension))
        } else {
            // If it's a file and matches the pattern, add it to results
            if (extensionMatches(filePath, extension)) {
                console.log(`file: ${filePath}, is a test file`)
                results.push(filePath)
            } else {
                console.log(`file: ${filePath}, is not a test file`)
            }
        }
    }

    return results
}

export default findFiles
