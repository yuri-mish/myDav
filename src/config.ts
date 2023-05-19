import * as dotenv from "dotenv";

dotenv.config();

class Config  {
    serverUrl = process.env.SERVERURL || 'http://localhost:5000'
    port=process.env.PORT||5000;
    rootPath = process.env.ROOTPATH || ''
    mongoConnect = process.env.MONGO_CONNECT || ''

}
export const config = new Config();
