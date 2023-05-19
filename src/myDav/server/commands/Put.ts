import { Request, Response } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import multer from "multer";
import path from 'node:path';
import { config } from "../../../config";
import { TreeFS } from "../../db/models/treefiles";
import { dirFromPath } from "../../helper";
import { parcePath } from "./helpers";
import { DAVServer } from "../Server";

export class Put implements IWebDavReqest {
  status = 200;

  async run(req: Request, res: Response, server: DAVServer) {
    console.log('devPath:', req.davPath);
    console.log('devPath:', req.headers);

    const { dir: parentDocPath, rpath } = parcePath(req.path)
    // const parentDocPath = dirFromPath(req.davPath);
    return TreeFS.find({
      owner: req.user._id,
      $or: [
        { pathText: rpath },
        { pathText: parentDocPath, isFile: false }
      ]
    }).then(async (records) => {
      const parentDoc = records.find(r => r.isFile === false);
      const size = Buffer.byteLength(req.rawBody);
      const doc = records.find(r => r.isFile === true) || new TreeFS({
        parent: parentDoc?._id,
        //  filename: req.davPath.filename,
        owner: req.user.id,
        isFile: true,
        ownerroot: req.user.root,
        createDate: new Date(),
        props: {
          displayname: req.davPath.filename,
          getcontentlength: size//<number>(req.get("content-length") ?? 0)
        }
      });
      doc.size = size; //<number>(req.get("content-length") ?? 0);
      doc.contentType = req.get('content-type'),
      doc.props = {
        ...doc.props,
        getcontentlength: size //<number>(req.get("content-length") ?? 0)
      }


      return server.fileSystem.write(doc.toObject(), req.rawBody, server)
        .then(async (filename) => {
          doc.filename = filename;
          await doc.save();
          return { status: this.status, value: {} }
        })



    }).catch(e => { return { status: 404, value: {} } });


  }
}