import { IWebDavReqest } from "./WebDawRequest";

export class Options implements IWebDavReqest {
    status=200;
    async run() {
        return {status:this.status, value: {}}
    }
}