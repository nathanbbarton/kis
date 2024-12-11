import { updateConfig } from "./config.js"
import testMatch from "../test-runtime/testMatch.js"
import runTestFiles from "../test-runtime/testRunner.js"
import reporter from "~/test-runtime/testReporter.js"

const kist = (args: string[]) => {

    /**
     * Config options
     *
     * --testExtension: run all test files that match file extension
     * --testOutDir: where can you find the test files, if using Typescript testOutDir should point
     *  to where typescript outputs your compiled test files, ex: dist/tests.
     */

    if (args.length < 1) {
        console.log("found no cli args looking for config")
        console.log("found no config, exiting")
        //TODO handle a config file
    } else {
        const testExtensionIndex = args.findIndex(arg => arg === "--testExtension")
        const testExtension = args[testExtensionIndex + 1]

        const testOutDirIndex = args.findIndex(arg => arg === "--testOutDir")
        const testOutDir = args[testOutDirIndex + 1]

        updateConfig({ testExtension, testOutDir })

        if (!testExtension) {
            console.error("missing required testExtension")
            process.exit(1)
        }

        if (!testOutDir) {
            console.error("missing required testOutDir")
            process.exit(1)
        }

        const files = testMatch(testExtension)

        runTestFiles(files)
            .then(() => {
                console.log("\n")
                console.log("all test files complete")

                if (!reporter.getTotalResult()) { // failing tests exit with error
                    process.exit(1)
                }
            })
            .catch(error => {
                console.error("caught error in test files: ", error)
            })

    }
}

kist(process.argv.slice(2))
