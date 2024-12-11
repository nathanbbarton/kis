import { statSync, readdirSync } from "fs"
import path from "path"
import { getConfig } from "../cli/config.js"

// Function to match files with a glob pattern
function findFiles(dir: string, extension: string): string[] {
    let results: string[] = []

    // Read the contents of the directory
    const files = readdirSync(dir)

    // Iterate through the files and directories
    for (const file of files) {
        const filePath = path.join(dir, file)
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

const extensionMatches = (filePath: string, extension: string) =>
    filePath.endsWith(extension)

// Main function to find and print files matching a glob pattern
function testMatch(extension: string) {
    console.log("looking for tests with extension: ", extension)

    const files = findFiles(getConfig().testOutDir, extension)

    console.log(`\nfiles found with extension ${extension}`)

    files.forEach((file) => console.log(`- ${file}`))

    return files
}

export default testMatch
