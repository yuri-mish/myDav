import { Request, urlencoded } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import { TreeFS } from "../../db/models/treefiles";
import path from "path";
import { parcePath } from "./helpers";

export class Proppatch implements IWebDavReqest {

  async run(req: Request) {
    console.log(req.body)

    type valProp = { _: any }
    const set = [...req.body.propertyupdate.set]
    const propsSet = set.map(s => {
      const el = s.prop?.[0];
      const [propName, elValProp] = Object.entries(el)?.[0];
      const propValue = (elValProp as valProp[])?.[0]._;
      return { propName, propValue }
    });

    const { dir, fname, rpath } = parcePath(req.path);
    return await TreeFS.findOne({ pathText: rpath, owner: req.user._id }).then(doc => {
      if (doc === null) return { status: 404, value: [] };
      propsSet.forEach(p => { (doc.props as any)[p.propName] = p.propValue })
      doc.save();
      return { status: 207, value: [] }
    });
  };

}