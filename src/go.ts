import {iolist, iolist_push, iolist_to_string} from "./io";

export interface GoFile {
    dir: string
    filename: string
    packageName: string
    import: iolist
    content: iolist
}

namespace GoFile {
    export function toString(f: GoFile): string {
        let res: iolist = [];
        iolist_push(res, ['package ', f.packageName, '\n']);
        iolist_push(res, [f.import, '\n']);
        iolist_push(res, f.content);
        return iolist_to_string(res);
    }

    export function merge(target: GoFile, src: GoFile) {
        iolist_push(target.import, ['\n', src.import, '\n']);
        iolist_push(target.content, ['\n', src.content, '\n']);
        if (
            (target.dir !== src.dir)
            || (target.filename !== src.filename)
            || (target.packageName !== src.packageName)
        ) {
            console.error('failed to merge file', {target, src});
            throw new Error("GoFile cannot be merged");
        }
        return target;
    }
}

export class Output {
    files = new Map<string, Map<string, GoFile>>();
    stack: GoFile[] = [];

    public getFile(packageName: string, filename: string, dir = '') {
        let files = this.files.get(packageName);
        if (!files) {
            files = new Map();
        }
        let file = files.get(filename);
        if (!file) {
            file = {
                packageName,
                filename,
                dir,
                import: [],
                content: [],
            }
        }
        return file;
    }public addRes(res:iolist){iolist_push(this.peekFile().content,res)}

    public peekFile() {
        return this.stack[this.stack.length - 1]
    }

    public popFile() {
        return this.stack.pop()
    }

    public pushFile(f: GoFile) {
        this.stack.push(f)
    }

    public merge(o: Output) {
        if (o.stack.length !== 0) {
            console.error("stack:", o.stack);
            throw new Error("o.stack is not empty");
        }
        o.files.forEach((files, packageName) => {
            files.forEach((file, filename) => {
                this.getFile(packageName, filename)
            })
        })
    }
}