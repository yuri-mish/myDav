import { Request ,Response, NextFunction } from "express";
import path from "path";
import { davPathType } from "../types";

export const davPath = (req:Request)=>{
    const delimiter='/';
    // const dirname = path.dirname(req.path);
    // const filename = path.basename(req.path);
    const pArray = decodeURIComponent(req.path).split(delimiter);
    // let dir = delimiter;
    let filename='';
    if (pArray?.[pArray.length-1]) {
        filename = pArray[pArray.length-1];
        pArray[pArray.length-1]='';
    }
    const dir = pArray.join(delimiter);

    req.davPath = {
        dir,
        filename,
        path: dir+filename
    };
    console.log(req.davPath)

};

export const dirFromPath = (davPath:davPathType):string => {

    return davPath.dir.substring(0, davPath.dir.length - 1)|| '/';
}
