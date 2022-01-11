import { Request,Response,NextFunction } from "express"
import jwt from'jsonwebtoken';
import Authtoken, { IAuthtoken } from '../models/authtoken';
interface IPayload{
    _id:string,
    iat:number,
    exp:number
}
export  const tokenval=async (req:Request,res:Response,next:NextFunction)=>{
    const token = req.header('authtoken');
    const tokenindb = await Authtoken.findOne({sesiontoken:token});
    if(!tokenindb){
        return res.status(401).json('Access denied');
    }
    console.log(token)
    if(!token){
        return res.status(401).json('Access denied');
    }
    const payload=jwt.verify(token,process.env.TOKENSECRET||'tokentest')as IPayload;
    req.userId=payload._id;
    next();
}