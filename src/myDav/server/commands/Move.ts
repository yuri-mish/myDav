import { Request, urlencoded } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import { TreeFS } from "../../db/models/treefiles";
import { createBasePath, parcePath } from "./helpers";



const diff = (destination: string, base: string) => destination.split(base).join('');

export class Move implements IWebDavReqest {
  status = 207;
  async run(req: Request) {

    const { dir: dirFrom, fname: filenameFrom, rpath: pathFrom } = parcePath(req.path);

    const destination = req.get('Destination') ?? '';
    const newpath = diff(destination, createBasePath(req));
    const { dir: dirTo, fname: filenameTo, rpath: pathTo } = parcePath(newpath);

    console.log({ dirTo, filenameTo, pathTo });

    await TreeFS.findOne({ pathText: pathFrom, owner: req.user._id }).then(async (doc) => {
      if (doc === null) return;
      if (doc.props.displayname !== filenameTo) {
        doc.props.displayname = filenameTo;
        doc.pathText = pathTo;
        await doc.save();
      } else {
        await TreeFS.findOne({ pathText: dirTo, owner: req.user._id }).then(async (parent) => {
          if (parent === null) return
          doc.parent = parent._id;
          await doc.save();
        })
      }
      // doc.pathText = pathTo;
    })

    return { status: 200, value: [
      {
        href: createBasePath(req)+pathTo,
        status: 'HTTP/1.1 200 OK'
      }
    ] }
  };

}