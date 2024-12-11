/**
 * @file testRunner.ts
 *
 * @author Nathan Barton
 *
 * @description
 * This file is responsible for sending test files to the test process spawner.
 *
 * @responsibilities
 * - Create promises for every test file. Full test execution is complete once all
 *  test process promises have resolved
 *
 * @dependencies
 * - `fs` node.js file system is used to track file path types
 * - `testProcess.js` for spawning test process for each test file
 *
 * @important
 * - you can change the limit of parallel tests by adjusting the 'parallel-limit' option. default=10
 *
 * @example
 * Import and use:
 *   import runTestFiles from './testRunner.js'
 *   runTestFiles(['dist/test1.test.js', 'dist/test2.test.js'])
 */

// Node.js dependencies
import { PathLike } from "fs"

// Local dependecnies
import { spawnTestProcess } from "./testProcess.js"
import reporter from "./testReporter.js"
import batchLimit from "~/util/batchLimit.js"

/**
 * Takes in an array of file paths, and spawns test processes for each of them.
 * It then awaits all spawned test process promises to complete
 *
 * @param {PathLike[]} files the array of test file paths
 */
const runTestFiles = async (files: PathLike[]) => {
    console.log("\n")
    console.log("starting tests")

    const TESTFILE_BATCH_LIMIT = 10

    try {
        await batchLimit(files, TESTFILE_BATCH_LIMIT, file => spawnTestProcess(file))

        reporter.printSummary() // log test results
    } catch (error) {
        console.error("runTestFiles failed with error: ", error)
    }
}

export default runTestFiles
