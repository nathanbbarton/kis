import Test from "./Test.js"
import { TestConfig } from "./types.js"

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
        // 1 argument just a string = placeholder test. Are placeholder tests autofail or auto succeed?
        if (typeof args[0] === "string") {
            newTest = new Test({descriptor: args[0]})
        } else if (typeof args[0] === "object") { // 1 argument and its config object
            newTest = new Test(args[0])
        } else {
            throw Error(`1 arg 'test()' expects string or object, received: ${typeof args[0]}`)
        }

    } else if (args.length === 2) {
        // 2 arguments received
        if (typeof args[0] === "string" && typeof args[1] === "object") { // 2 argument, string, config
            newTest = new Test({
                descriptor: args[0],
                ...args[1]
            })
        } else if (typeof args[0] === "string" && typeof args[1] === "function") { // 2 argument, string, function
            newTest = new Test({
                descriptor: args[0],
                baseTest: args[1]
            })
        } else {
            throw Error(`2 arg 'test()' expects arg1=string, and arg2=object or function, received: arg1=${typeof args[0]} arg2=${typeof args[1]}`)
        }

    } else if (args.length === 3) {
        // 3 argument, string, config, function
        if (typeof args[0] === "string" && typeof args[1] === "object" && typeof args[2] === "function") {
            newTest = new Test({
                descriptor: args[0],
                ...args[1],
                baseTest: args[2]
            })
        } else {
            throw Error(`3 arg 'test()' expects string, object, function, received: ${typeof args[0]}, ${typeof args[1]}, ${typeof args[2]}`)
        }
    } else {
        throw Error(`unexpected num of args, received ${args.length}, test accepts up to 3`)
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
