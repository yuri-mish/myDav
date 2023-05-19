import { Request, Response } from "express";
import { DBUser } from "../db/models";



class Auth {
    type: string;
    nounce: string = '';
    constructor(type: string) {
        this.type = type;
    }
    async check(req: Request, res: Response) {
        const hasAuth = req.get('Authorization') ?? req.get('authorization') ?? '';
        req.user = await DBUser.findByToken(hasAuth) ?? '';
        if (!req.user) {
            if (this.type === 'Digest') {
                res.setHeader('WWW-Authenticate', `Digest realm=default, algorithm=SHA-256, ${this.nounce}`);
            } else {
                res.setHeader('WWW-Authenticate', 'Basic realm=default, charset="UTF8"');
            }
            throw ({ status: 401, error: 'AUTH' });
        }
        return req.user
    }
}
export class AuthBasic extends Auth {
    constructor() {
        super('Basic')
    }

}

export class AuthDigest extends Auth {
    constructor() {
        super('Digest')
        super.nounce = 'sdf76577dd6s5df8asFG6d5f';
    }

}