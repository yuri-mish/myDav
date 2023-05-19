import { Request, Response } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import { TreeFS } from "../../db/models/treefiles";
import { dirFromPath } from "../../helper";

export class Mkcol implements IWebDavReqest {
  status = 200;

  async run(req: Request, res: Response) {

    const docPath = dirFromPath(req.davPath);
    const pathArray = docPath.split('/');
    const newDirName = pathArray.pop() || '';
    const parent = pathArray.join('/') || '/';

    return TreeFS.findOne({ pathText: docPath, owner:req.user._id })
      .then(async (doc) => {
        if (doc !== null) return { status: 405, value: {} };
        const parentDoc = await TreeFS.findOne({ pathText: parent, owner:req.user._id }).exec();

        doc = new TreeFS({
          parent: parentDoc?._id,
          filename: newDirName,
          isFile: false,
          createDate: new Date(),
          owner:req.user._id,
          ownerroot:req.user.root,
          size: 0,
          props: {
            displayname: newDirName,
            getcontentlength: 0
          }
        });
        doc.save();

        return { status: this.status, value: {} }
      });


  }
}