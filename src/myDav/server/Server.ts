import { Request, Response } from "express";



class Auth {
    type: string;
    nounce: string = '';
    constructor(type: string) {
        this.type = type;
    }
    async check(req: Request, res: Response) {
        console.log('user', req.user?.name);
        const hasAuth = req.get('Authorization');
        if (req.user && !hasAuth) {
            if (this.type === 'Digest') {
                res.setHeader('WWW-Authenticate', `Digest realm=default, algorithm=SHA-256, ${this.nounce}`);
            } else {
                res.setHeader('WWW-Authenticate', 'Basic realm=default, charset="UTF8"');
            }

            throw ({ status: 401, error: 'AUTH' });
        }

        req.user = {
            name: 'user'
        };

        return req.user
    }
}
class AuthBasic extends Auth {
    constructor() {
        super('Basic')
    }

}

class AuthDigest extends Auth {
    constructor() {
        super('Digest')
        super.nounce = 'sdf76577dd6s5df8asFG6d5f';
    }

}

export class DAVServer {
    auth: Auth = new AuthBasic();

    // constructor() {
    // }

    async requestHandler(req: Request, res: Response) {

        console.log(req.method);
        console.log(req.headers);

        res.setHeader('content-type', 'application/xml');
        return this.auth.check(req, res).then((resp) => {
            res.status(200).send('gggggg');
        }).catch((e) => {
            res.sendStatus(e.status);
        });
    }

}