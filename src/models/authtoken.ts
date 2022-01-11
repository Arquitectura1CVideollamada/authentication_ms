import {Schema,model,Document} from 'mongoose';
import userSchema from './user';

export interface IAuthtoken extends Document{
    sesiontoken:string,
    user:object
}
const authtokenSchema =new Schema({
    sesiontoken:{
        type:String,
    },
    user:userSchema.schema
},{
    //timestamps: true
});

export default model<IAuthtoken>('Sesiontoken',authtokenSchema);