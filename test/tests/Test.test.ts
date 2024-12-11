import assert from "node:assert"
import { test } from "../src/TestClass/TestFactory.js"


const autoSuccess = () => true
const autoFail = () => false

const assertFail = async () => {
    const t = await test("assertFail", {
        options: { noReport: true }
    }, autoFail)

    assert(!t.pass())
}

const assertSuccess = async () => {
    const t = await test("assertSuccess", { 
        options: { noReport: true } 
    } , autoSuccess)

    assert(t.pass())
}

test("should fail if test function returns false", assertFail)
test("should succeed if test function returns true",  assertSuccess)

test("should have the same result when using different test() signatures",{
    subTests: [
        test("should all succeed when using different test() signatures", {
            subTests: [
                test("2 args, descriptor and test function success", assertSuccess),
                test("2 args, descriptor and config success", { baseTest: assertSuccess }),
                test("3 args, descriptor config and test function success", { options: {}}, assertSuccess)
            ]
        }),
        test("should all fail when using different test() signatures", {
            subTests: [
                test("2 args, descriptor and test function fail", assertFail),
                test("2 args, descriptor and config fail", { baseTest: assertFail }),
                test("3 args, descriptor config and test function fail", { options: {}}, assertFail)
            ]
        })
    ]
})

