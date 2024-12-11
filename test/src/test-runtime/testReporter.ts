import { PathLike } from "fs"
import { basename } from "path"
import { TestResult, TestSubmission } from "~/TestClass/types.js"

const logTest = (test: TestResult) => {
    let logString =` - ${test.descriptor}`
    if (test.pass) {
        logString = "✔️ " + logString
    } else {
        logString = "❌" + logString
    }

    //pad front of log with depth
    console.log(logString)
}

type TestsMap = Map<string, TestResult>
type TestFilesMap = Map<string, TestsMap>

class TestReporter {

    #testFiles: TestFilesMap
    #totalResult: boolean

    constructor() {
        this.#testFiles = new Map<string, TestsMap>()
        this.#totalResult = false
    }

    getTotalResult() {
        return this.#totalResult
    }

    submitResult(testSubmission: TestSubmission) {
        const { test, file } = testSubmission

        const testsMap = this.#testFiles.get(file)

        if (testsMap)
            testsMap.set(test.descriptor, test)
        else
            throw Error(`test submit failed, submitted test to unregistered file ${file}`)

        logTest(test)
    }

    #printTestTree() {
        console.log("\nTest Tree Results:")

        const findRootResults = (testMap: TestsMap): TestResult[] => {
            // Create a Set to track all descriptors that appear as children
            const childDescriptors = new Set<string>()

            // Populate the childDescriptors set with all children from every TestSubmission
            testMap.forEach(result => {
                result.children?.forEach((child) => childDescriptors.add(child))
            })

            // Filter submissions that are not in the childDescriptors set
            const rootResults: TestResult[] = []
            testMap.forEach(result => {
                if (!childDescriptors.has(result.descriptor)) {
                    rootResults.push(result)
                }
            })

            return rootResults
        }


        this.#testFiles.forEach((testMap) => {
            // Recursive function to print each node in the tree
            const printNode = (descriptor: string, prefix: string, isLast: boolean) => {
                const submission = testMap.get(descriptor)
                if (!submission) {
                    throw Error(`failed to find test submission for ${descriptor} while printing test tree result`)
                } else {
                    const passMark = submission.pass ? "✔️ " : "❌"
                    const logString = `${prefix}${isLast ? "└──" : "├──"} ${passMark} ${submission.descriptor}`
                    console.log(logString)

                    const newPrefix = prefix + (isLast ? "    " : "│   ")
                    submission?.children?.forEach((childDescriptor, index) => {
                        const isChildLast = index === submission.children!.length - 1
                        printNode(childDescriptor, newPrefix, isChildLast)
                    })
                }
            }

            const rootTests = findRootResults(testMap)

            rootTests.forEach(result => {
                // Print the root node without a prefix
                const { pass, descriptor } = result
                const passMark = pass ? "✔️ " : "❌"
                console.log(`${passMark} ${descriptor}`)

                result.children?.forEach((child, childIndex) => {
                    const isChildLast = childIndex === result.children!.length - 1
                    printNode(child, "", isChildLast)
                })
            })
        })
    }

    printSummary() {
        this.#printTestTree()

        console.log("\nTest Summary: ")
        console.log("—————————————")

        let totalTests = 0
        let totalPass = 0

        this.#testFiles.forEach((testMap, file) => {
            const fileTests = testMap.size
            totalTests += fileTests

            let filePass = 0

            testMap.forEach(test => {
                if (test.pass) {
                    filePass++
                    totalPass++
                }
            })

            console.log(`${file}: ${filePass}/${fileTests}`)
        })

        this.#totalResult = totalTests === totalPass

        console.log("\n")
        console.log("Total Tests: ", totalTests)
        console.log("Total Passed: " + totalPass + "/" + totalTests)
        console.log(`Total Failed: ${totalTests - totalPass}/${totalTests}`)
    }

    registerTestFile(file: PathLike) {
        this.#testFiles.set(basename(file.toString()), new Map<string, TestResult>())
    }
}

export {
    TestReporter
}

const reporter = new TestReporter()

export default reporter
