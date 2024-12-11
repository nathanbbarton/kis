import Test from "./Test.js"

export interface TestBase {
    descriptor: string
    pass: () => boolean
    getSubTests: () => Promise<Test | Test[] |null>
}

export type SubTests = Promise<Test> | Promise<Test>[]

export interface TestConfig {
    descriptor?: string
    baseTest?: Function
    subTests?: SubTests
    beforeEach?: Function
    afterEach?: Function
    options?: TestConfigOptions
}

export interface TestConfigOptions {
    subTestNoReport?: boolean
    noReport?: boolean // should the test be reported for tracking
    runSync?: boolean // run all tests synchronously or asynchronously
    subTestsFirst?: boolean // run sub-tests before or after base-test
    failNoTest?: boolean // tests without any detected test function, autofail or auto succeed?
    // option for whether failed sub tests fail base test or not
}

export interface TestConstructorArgs {
    descriptor: string
    beforeEach?: Function
    baseTest?: Function
    subTests?: SubTests
    afterEach?: Function
    options?:  TestConfigOptions
}

export type TestResult = {
    descriptor: string
    children: string[] | null
    pass: boolean
}

export type TestSubmission = {
    test: TestResult,
    file: string
}
