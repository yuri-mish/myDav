import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { DAVServer } from './myDav';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.options('/', () => {
  console.log(1111)
});
// app.options('/dav', () => {
//   console.log(222)
// });

const davServer = new DAVServer();
app.use('/dav', (req: Request, res: Response) => {
  console.log('in dav');
  davServer.requestHandler(req, res).then(resp => {
    console.log('---');
  })
  // .catch(e =>{
  //   console.log(e);
  // });
});

app.get('/', (req: Request, res: Response) => {
  console.log('in root')
  res.send('Express + TypeScript Server!!!!');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});