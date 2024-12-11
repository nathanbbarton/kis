import Test from "./Test.js"
import { TestConfig } from "./types.js"

class TestArgumentError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "TestArgumentError"
        this.stack = (new Error()).stack
    }
}

// Eww
async function test(
    ...args:
        [string] |
        [TestConfig] |
        [string, Function] |
        [string, TestConfig] |
        [string, TestConfig, Function]
): Promise<Test>

async function test(...args: any[]): Promise<Test> {
    let newTest: Test

    if (args.length === 1) {
        // 1 argument just a string = placeholder test
        if (typeof args[0] === "string") {
            newTest = new Test({descriptor: args[0]})
        } else if (typeof args[0] === "object") { // 1 argument and its config object
            newTest = new Test(args[0])
        } else {
            const errorMsg = `1 arg 'test()' expects string or object, received: ${typeof args[0]}`
            throw new TestArgumentError(errorMsg)
        }

    } else if (args.length === 2) {
        // 2 arguments received
        if (typeof args[0] === "string" && typeof args[1] === "object") {
            newTest = new Test({
                descriptor: args[0],
                ...args[1]
            })
        } else if (typeof args[0] === "string" && typeof args[1] === "function") {
            newTest = new Test({
                descriptor: args[0],
                baseTest: args[1]
            })
        } else {
            const received = `received 2 args: ${typeof args[0]}, ${typeof args[1]}.`
            const expected = "expected string, object or function"
            const errorMsg = `${received} ${expected}`
            throw new TestArgumentError(errorMsg)
        }

    } else if (args.length === 3) {
        // 3 argument, string, config, function
        if (typeof args[0] === "string" &&
            typeof args[1] === "object" &&
            typeof args[2] === "function") {
            newTest = new Test({
                descriptor: args[0],
                ...args[1],
                baseTest: args[2]
            })
        } else {
            const received = `${typeof args[0]}, ${typeof args[1]}, ${typeof args[2]}`
            const expected = "expected string, object, function"
            const errorMsg = `${received} ${expected}`
            throw new TestArgumentError(errorMsg)
        }
    } else {
        const errorMsg = `unexpected num of args, received ${args.length}, test accepts up to 3`
        throw new TestArgumentError(errorMsg)
    }

    try {
        await newTest.runTest()
    } catch (error) {
        console.error(error)
    }

    return newTest
}

// Export the test factory
export { test }
