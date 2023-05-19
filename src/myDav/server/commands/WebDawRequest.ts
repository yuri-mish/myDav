import { Request, Response } from "express"
import { DAVServer } from "../Server"

export interface ICommandResult {
    status: number,
    value?: any

}
export interface IWebDavReqest {
    run(req:Request, res?:Response, server?:DAVServer): Promise<ICommandResult>
}