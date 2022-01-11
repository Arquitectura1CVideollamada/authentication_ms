import {Schema,model,Document} from 'mongoose';
import userSchema from './user';

export interface IUsertoken extends Document{
    token:string,
    user:object
}
const usertokenSchema =new Schema({
    token:{
        type:String,
    },
    user:userSchema.schema
},{
    //timestamps: true
});

export default model<IUsertoken>('Authtoken',usertokenSchema);