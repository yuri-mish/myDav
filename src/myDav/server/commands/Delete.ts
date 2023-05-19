import { Request, Response } from "express";
import { IWebDavReqest } from "./WebDawRequest";
import multer from "multer";
import path from 'node:path';
import { config } from "../../../config";
import { TreeFS } from "../../db/models/treefiles";

export class Delete implements IWebDavReqest {
    status = 200;

    async run(req: Request, res: Response) {

        await TreeFS.schema.methods.delete(req.davPath, req);

        return { status: this.status, value: {} }
    }
}