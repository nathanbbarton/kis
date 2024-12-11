import { basename } from "path"
import { TestBase, SubTests, TestConfigOptions, TestResult, TestConstructorArgs } from "./types.js"
import { isSubTests, isTestConfigOptions, isFunction } from "./validators.js"

// Helper function for sending IPC messages (without child tests)
const sendIpcMessage = async (test: Test) => {
    const subTests = await test.getSubTests()

    let children = null
    if (Array.isArray(subTests)) {
        children = subTests.map(test => test.descriptor)
    } else if (subTests) {
        children = [subTests.descriptor]
    }

    const testResult: TestResult = {
        descriptor: test.descriptor,
        pass: test.pass(),
        children: children
    }

    process.send?.({
        test: testResult,
        file: filename
    })
}

// extract filename from the node process arg array
// when registering tests and returning them, must be able to know which file it came from
const filename = basename(process.argv[1])

// TODO support object style configuration as well as functional

class Test implements TestBase{

    descriptor: string = ""
    #beforeAll: Function | null = null
    #beforeEach: Function | null = null
    #baseTest: Function | null = null
    #subTests: SubTests | null = null
    #afterEach: Function | null = null
    #afterAll: Function | null = null
    #options: TestConfigOptions = {
        noReport: false,
        runSync: false,
        subTestsFirst: false
    }
    #pass: boolean = false
    #complete: boolean = false

    constructor({
        descriptor,
        beforeEach,
        baseTest,
        subTests,
        afterEach,
        options = {}
    }: TestConstructorArgs) {
        this.descriptor = descriptor
        this.#beforeEach = isFunction(beforeEach) ? beforeEach : null
        this.#baseTest = isFunction(baseTest) ? baseTest : null
        this.#subTests = isSubTests(subTests) ? subTests : null
        this.#afterEach = isFunction(afterEach) ? afterEach : null
        this.#options = isTestConfigOptions(options) ? options : {}
    }

    pass() { return this.#pass }

    async getSubTests() { //return Test inside subTest promsies

        if(Array.isArray(this.#subTests)) {
            return await Promise.all(this.#subTests)
        } else if (this.#subTests) {
            return await this.#subTests
        } else {
            return this.#subTests // return falsey subTests let caller handle
        }
    }

    isComplete(){ return this.#complete }

    async runTest() {
        console.log("starting test: ", this.descriptor)
        try {

            if (this.#baseTest) {
                const result = await this.#baseTest()

                if (typeof result === "boolean") {
                    this.#pass = result
                } else {
                    this.#pass = true
                }

            } else {
                this.#pass = true
            }

        } catch (error) {
            this.#pass = false

        } finally {
            if (!this.#subTests) {
                this.#complete = true
                if (!this.#options.noReport)  {
                    sendIpcMessage(this)
                }
            } else {

                try {
                    await this.#waitForCompletion()
                    if (!this.#options.noReport)  {
                        sendIpcMessage(this)
                    }

                } catch(error) {
                    console.error(`unexpected error waiting for test completion: ${error}`)
                }
            }
        }
    }

    #waitForCompletion = () => {
        return new Promise<void>(resolve => {
            const checkCompletion = async () => {
                const rawTests = await this.getSubTests()
                const subTestsArray = Array.isArray(rawTests) ? rawTests : [rawTests]
                const subTestsDone = subTestsArray.every(test => test?.isComplete)

                if (subTestsDone) {
                    // Mark the parent test as complete only when all children are complete
                    if (subTestsArray.some(test => !test?.pass)) {
                        this.#pass = false
                    }

                    this.#complete = true
                    console.log(`${this.descriptor} - complete`)
                    resolve()
                } else {
                    setTimeout(checkCompletion, 500) // Recheck in 500ms
                }
            }

            checkCompletion()
        })
    }

}

export default Test
