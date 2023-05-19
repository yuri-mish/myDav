import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { DAVServer } from './myDav';
import { mongoinit } from './myDav/db/mongodb';
import bodyParser from 'body-parser';
import xmlBodyParser from 'body-parser-xml';
import { config } from './config';
import { davPath } from './myDav/helper';
import { processors } from 'xml2js'
const stripprefix = processors.stripPrefix;

xmlBodyParser(bodyParser);
dotenv.config();
mongoinit();

const app: Express = express();

// app.get('/', (req: Request, res: Response) => {
//   console.log('in root')
//   res.send('Express + TypeScript Server!!!!');
// });


const davServer = new DAVServer();
let rawBodySaver = function (req: Request, _: Response, buf: Buffer, encoding: BufferEncoding) {
  if (buf && buf.length) {
    req.rawBody = buf;
  }
}

const checkheadres = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.headers['content-type']) req.headers['content-type'] = 'application/octet-stream';
  next();
}

app.use(checkheadres);
app.use(bodyParser.xml({ verify: rawBodySaver, xmlParseOptions: { tagNameProcessors: [stripprefix] } }));
app.use(bodyParser.raw({ verify: rawBodySaver, inflate: true, limit: '1000mb', type: '*/*' }));


app.use('/',
  (req: Request, res: Response) => {
    davPath(req);
    console.log('in dav');
    davServer.requestHandler(req, res)
      .then(resp => {
        console.log('***');
      })
      .catch(e => {
        console.log(e);
      });
  });



app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
});