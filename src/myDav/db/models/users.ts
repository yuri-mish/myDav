import { HydratedDocument, Model, Schema, model } from 'mongoose';
export interface IDbUser {
  name: string,
  password: string,
  root?: string,
  isAdmin: boolean,
  token?: string
}
interface IDbUserMethods {
  _t:boolean
}

interface UserModel extends Model<IDbUser, IDbUserMethods> {
  createUser(userData: IDbUser): Promise<HydratedDocument<IDbUser, IDbUserMethods>>;
  createToken(userData: IDbUser): string;
  findByToken(token:string): IDbUser;
}

export const dbUserSchema = new Schema<IDbUser>({
  name: String,
  password: { type:String, select:false},
  root: String,
  isAdmin: Boolean,
  token: { type: String, select:false}
});

const createToken = (userData: IDbUser) => {
  return 'Basic '+ (Buffer.from((userData.name + ':' + userData.password))).toString('base64');
}

dbUserSchema.static('createUser', async function createUser(userData: IDbUser) {
  return this.findOne({ name: userData.name })
    .then(async (r: any) => {
      if (r === null) {
        try {
          return await this.create({
            name: userData.name,
            password: userData.password,
            root: `/${userData.root ?? userData.name}`,
            isAdmin: userData.isAdmin,
            token: createToken(userData),
          });
        } catch (e) {
          throw ({ error: 'Database create user error' });
        }
      } else {
        throw ({ error: 'Unable create duplicated user' });
      }
    }
    );
});

dbUserSchema.static('findByToken', function findByToken(token:string) {
  return this.findOne({token});
} )

export const DBUser = model<IDbUser, UserModel>('DBUsers', dbUserSchema);