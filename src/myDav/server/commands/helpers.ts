import { Request } from "express";
import { config } from "../../../config";
import path from "path";

export const createBasePath = (req: Request):string=>{
    return req.protocol + '://' + req.hostname + ':' + config.port  + req.baseUrl
}

export const parcePath = (source: string, req?: Request) => {

    const dir = path.posix.normalize(decodeURIComponent(path.dirname(source)))
    const fname = decodeURIComponent(path.basename(source))
    const rpath = dir + (dir === '/' ? '' : '/') + fname
    return { dir, fname, rpath }
  }