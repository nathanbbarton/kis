import { SubTests, TestConfigOptions } from "./types.js"
// Type Validation FUNCTIONS
export const isFunction = (fn: any): fn is Function => typeof fn === "function"

export const isSubTests = (val: any): val is SubTests =>
    val instanceof Promise || (Array.isArray(val) && val.every(item => item instanceof Promise))

export const isTestConfigOptions = (obj: any): obj is TestConfigOptions =>
    obj !== null && typeof obj === "object" &&
  ("runSync" in obj ? typeof obj.runSync === "boolean" : true) &&
  ("subTestsFirst" in obj ? typeof obj.subTestsFirst === "boolean" : true) &&
  ("failNoTest" in obj ? typeof obj.failNoTest === "boolean" : true)
