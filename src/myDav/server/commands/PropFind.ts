import { Request, urlencoded } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import { TreeFS as FileModel } from "../../db/models/treefiles";
import path from "path";
import { createBasePath, parcePath } from "./helpers";



export class PropFind implements IWebDavReqest {
  status = 207;
  async run(req: Request) {

    const { dir, fname, rpath } = parcePath(req.path, req);

    const res0 = await FileModel.findOne({ pathText: rpath, owner: req.user._id }).then(async (doc) => {
      if ((req.get('depth')??'0') === '0' || doc?.isFile) {
        return doc === null ? [] : [doc];
      }
      else return await FileModel.find({ $or: [{ 'parent': doc?._id }, { _id: doc?._id }] })
    });

    const resp = res0.map((f) => {
      const prop = f.get('props').toObject(); delete prop._id;
      return {
        href: (createBasePath(req) + encodeURI(f.pathText ?? '')),
        propstat: {
          status: 'HTTP/1.1 200 OK',
          prop
        }
      };
    });

    return ({
      status: resp.length ? 207 : 404,
      value: resp
    });
  }
}