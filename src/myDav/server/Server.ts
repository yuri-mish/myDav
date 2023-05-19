import { Request, Response } from "express";
import { AuthBasic } from "./auth";
import { getCommandHadler } from "./commands";
import xml2js from 'xml2js';
import { ICommandResult, IWebDavReqest } from "./commands/WebDawRequest";
import { FileSystem } from "./FileSystem";
import { config } from "../../config";
import { TreeFS } from "../db/models/treefiles";


export class DAVServer {

  auth = new AuthBasic();
  fileSystem: FileSystem = new FileSystem('/testdav');

  constructor() { }

  async requestHandler(req: Request, res: Response) {

    console.log(req.method);

    await this.auth.check(req, res).catch((e) => {
      res.sendStatus(e.status);
      throw new Error(('NOT AUTH'));
    });
    const command = getCommandHadler(req.method);
    const response: ICommandResult = await command.run(req, res, this);
    const result = {
      'multistatus': {
        '$': { 'xmlns': 'DAV:' },
        response: response?.value
      }
    }

    const builder = new xml2js.Builder({});
    const xml = builder.buildObject(result);

    console.log(xml)


    res.setHeader('content-type', 'application/xml');
    res.setHeader('allow', 'PROPPATCH,PROPFIND,OPTIONS,DELETE,UNLOCK,COPY,LOCK,MOVE')
    res.setHeader('DAV', '1,2');
    res.status(response.status).send(xml);
  }

}