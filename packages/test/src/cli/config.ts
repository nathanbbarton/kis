
type KisTestConfig = {
    testExtension: string
    testOutDir: string
}


const config: KisTestConfig = {
    testExtension: "",
    testOutDir: ""
}

export const getConfig = () => { return config }
export const updateConfig = (updates: Partial<KisTestConfig>) => {
    Object.assign(config, updates)
}
