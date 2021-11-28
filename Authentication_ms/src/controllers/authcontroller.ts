import {Request,Response} from 'express'

import User,{IUser} from '../models/user';

import jwt from 'jsonwebtoken';

export const singup= async(req:Request,res:Response)=>{
    try {
        const user : IUser=new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    });
    user.password= await user.encryptPassword(user.password);
    console.log(user.password);
    const saveduser = await user.save();
    const token:string=jwt.sign({_id:saveduser._id},process.env.TOKENSECRET||'tokentest');
    res.header('auth-token',token).json(saveduser);
    console.log(saveduser);
    } catch (e) {
        res.status(400).json(e);
    }
    
}
export const singin=async (req:Request,res:Response)=>{
    const user=await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).json('invalid email or password');
    }
    const correctpass:boolean=await user.validatePassword(req.body.password);
    if(!correctpass){
        return res.status(400).json('invalid password');
    }
    const token:string=jwt.sign({_id:user._id},process.env.TOKENSECRET||'tokentest',{
        expiresIn:60*5
    });
    res.header('auth-token',token).json(user);
    
}
export const profile=async (req:Request,res:Response)=>{
    const user=await User.findById(req.userId,{password:0});
    if(!user){
        res.status(404).json('invalid user')
    }
    res.json(user);
}