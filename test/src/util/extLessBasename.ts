import { PathLike } from "fs"
import { basename, normalize } from "path"

const extLessBasename = (file: PathLike, ext: string) => {
    const filePath = normalize(file.toString())
    console.log("filePath: ", filePath)
    console.log("ext lengh: ", ext.length)
    console.log("extension: ", ext)

    if (filePath.endsWith(ext)) {
        const withoutExt = filePath.slice(0, -ext.length)
        console.log("withoutExt:", withoutExt)
        const filename = basename(withoutExt)
        console.log("files basename without extension: ", filename)
        return filename
    } else {
        console.log("extension did not match file")
    }
}

export default extLessBasename
