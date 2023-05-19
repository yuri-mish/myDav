import { Options } from "./Options";
import { IWebDavReqest } from "./WebDawRequest";
import { PropFind } from './PropFind';
import { Request } from "express";
import { Put } from "./Put";
import { NotImplemented } from "./NotImplemented";
import { Delete } from "./Delete";
import { Mkcol } from "./MkCol";
import { Proppatch } from "./Proppatch";
import { Move } from "./Move";


const  _commands = {
    options: new Options(),
    propfind: new PropFind(),
    put: new Put(),
    delete: new Delete(),
    mkcol: new Mkcol(),
    proppatch: new Proppatch(),
    move: new Move()
    // notImplemnted: new NotImplemented(),
}
// class NotImplemented implements IWebDavReqest {
//     async run (req:Request) {
//         return {status:403};
//     }
// }
const commands = new Map(Object.entries(_commands));
export const getCommandHadler = (method:string) => {
    const handler = commands.get(method.toLowerCase());
    return handler ?? new NotImplemented();
}
