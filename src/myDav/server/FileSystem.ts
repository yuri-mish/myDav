import { mkdir } from 'node:fs/promises';
import fs from 'fs/promises';
import { TFile} from './../db/models/treefiles';
import { DAVServer } from './Server';

export class FileSystem {
    rootPath: string

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        mkdir('/test/testing/mode', { recursive: true });
    }

    async stat(path?: string) {
        return fs.stat(this.rootPath + (path ?? ''));
    }

    createhasgdir = async (date:Date,ownerroot:string): Promise<string> =>{
        const dir = '/'+date.getFullYear().toString()+'/'+date.getMonth().toString()
        await fs.mkdir(this.rootPath+ownerroot+dir, {recursive:true})
        return dir+'/';
    }

    async write(
        doc:any,
        data:Buffer,
        server:DAVServer
         ){
        return this.createhasgdir(doc.createDate, doc.ownerroot ).then(hashdir => {
            console.log(this.rootPath + doc.ownerroot +hashdir+ doc.props.displayname);
            fs.writeFile(this.rootPath + doc.ownerroot +hashdir+ doc.props.displayname, data)
                .catch(e => {
                    console.log('e:',e)
                    throw new Error(('WRITE_FILE_ERROR'))} );
            return this.rootPath + doc.ownerroot +hashdir+ doc.props.displayname
        });
    }
}