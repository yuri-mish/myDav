import { Request } from "express";
import { IWebDavReqest } from "./WebDawRequest";

export class NotImplemented implements IWebDavReqest {
    async run (req:Request) {
        return {status:403};
    }
}