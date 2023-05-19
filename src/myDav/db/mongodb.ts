import * as mongoose from 'mongoose';
import { DBUser } from './models/users';
import { config } from '../../config';




export const mongoinit = async () => {
    await mongoose.connect(config.mongoConnect)
        .then(async () => {

            const silence = DBUser.createUser({
                name: 'yuri',
                password: '123',
                isAdmin: true
            })
                .then(res => {
                    return res;
                })
                .catch(e => console.log('user save error:', e))
            console.log('silence:', silence); // 'Silence'
        }).catch(err => console.log(err));
}

