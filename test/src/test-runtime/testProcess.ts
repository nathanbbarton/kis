/**
 * @file testProcess.ts
 *
 * @author Nathan Barton
 *
 * @description
 * This file is responsible for spawning child processes for a given test file. It collects logs
 * from stdout and stderr, and receives messages through IPC to report on test results.
 *
 * @responsibilities
 * - Spawn child processes to run test files
 * - Handle stdout, stderr, and IPC messages from test processes
 * - Aggregate test results and provide a final summary report
 * - Log real-time outputs from test execution
 *
 * @dependencies
 * - `child_process.spawn` for running test files in separate processes
 * - `testReporter.js` for submitting and summarizing test results
 * - `testExecution.js` for test definitions and execution structure
 *
 * @important
 * - Ensure that the test files are valid Node.js scripts.
 * - Tests are run with `node testfile.test.js`
 *
 * @example
 * Import and use:
 *   import { spawnTestProcess } from './testProcess.js'
 *   spawnTestProcess('path/to/test1.js')
 */

/* NodeJS dependencies */
import { PathLike } from "fs"
import { spawn } from "child_process"

// local dependencies
import reporter from "./testReporter.js"
import { TestSubmission } from "../TestClass/types.js"

/**
 * A very basic Error message object, to be able to receive error messages across IPC
 */
export type ErrorMessage = { error: string }

/**
 * Takes in an message and returns whether it is a {ErrorMessage} type
 *
 * @param {any} message the object to compare
 * @returns {boolean}
 */
const isErrorMessage = (message: any): message is ErrorMessage =>
    (message as ErrorMessage).error !== undefined

/**
 * Creates a new promise to spawn a child process that executes a given test file.
 *
 * @param {PathLike} file Path to the test file
 * @returns {Promise<void>} the created promise
 */
export const spawnTestProcess = (file: PathLike): Promise<void> => //implicit return
    new Promise<void>((resolve, reject) => {
        console.log(`spawning test process for file ${file}`)
        // Create stdout and stderr string 'buffers'
        let stdoutBuffer = ""
        let stderrBuffer = ""

        // spawn the child_process that will run the test file
        const testProcess = spawn("node", [file as string], {
            // inherit stdin, pipe stdout, pipe stderr, enable IPC
            stdio: ["inherit", "pipe", "pipe", "ipc"]
            // IPC is required to be able send messages between test and main processes
        })

        testProcess.on("spawn", () => {
            console.log(`test file ${file} spawned successfully`)
            reporter.registerTestFile(file)
        })

        // receive any data from the piped stdout
        testProcess.stdout?.on("data", (data) => {
            stdoutBuffer += data.toString() // add the data to the buffer

            const lines = stdoutBuffer.split("\n") // split all data by new lines
            stdoutBuffer = lines.pop() || "" // save incomplete line to buffer

            lines.forEach(line => {
                if (line.trim())
                    console.log(line.trim()) // log only non-empty lines
            })
        })

        // receive any data from the piped stderr
        testProcess.stderr?.on("data", (data) => {
            stderrBuffer += data.toString()

            const lines = stderrBuffer.split("\n")
            stderrBuffer = lines.pop() || ""

            lines.forEach(line => {
                if (line.trim())
                    console.error(line.trim()) // log only non-empty lines
            })
        })

        // receive any messages from process.send's IPC
        testProcess.on("message", (message: TestSubmission | ErrorMessage) => {
            if (isErrorMessage(message)) {
                console.error("test process exited, Error: ", message.error)
                reject()
            }

            reporter.submitResult(message as TestSubmission) // collect test results
        })

        // prep test process for closing
        testProcess.on("close", () => {
            // flush remaining buffer contents if any
            if (stdoutBuffer.trim()) {
                console.log(stdoutBuffer.trim())
            }
            if (stderrBuffer.trim()) {
                console.error(stderrBuffer.trim())
            }

            console.log(`${file} tests complete`)

            resolve() // resolve the spawned promise
        })

        // handle any errors by rejecting the spawned promise
        testProcess.on("error", (error) => { reject(error) })

        // log exit codes
        testProcess.on("exit", (code) => {
            let exitString: string
            if (code !== 0) {
                exitString = `test process exited, failed with exit code ${code}`
                console.error(exitString)
                reject(exitString)
            } else {
                exitString = `test process exited, succeeded with code ${code}`
                console.log(exitString)
                resolve()
            }
        })
    })
