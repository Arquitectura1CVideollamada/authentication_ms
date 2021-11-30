import {Request,Response} from 'express'

import User,{IUser} from '../models/user';

import jwt from 'jsonwebtoken';

import path from 'path';

import fs from 'fs-extra';

function ValidateEmail(input:string):boolean{

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }

export const singup= async(req:Request,res:Response)=>{
    try {
        const user : IUser=new User({
        username:req.body.username,
        email:req.body.email,
        image:null,
        password:req.body.password
    });
    user.password= await user.encryptPassword(user.password);
    console.log(user.password);
    if(!ValidateEmail(user.email)){
        return res.status(400).json('invalid email');
    };
    const saveduser = await user.save();
    res.json(saveduser);
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
        expiresIn:60*60*24
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

export const updprofile=async (req:Request,res:Response)=>{
    console.log('upd');
    try {
        const newuser : IUser=new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        image:req.file?.path
    });
    if(newuser.password){
        newuser.password= await newuser.encryptPassword(newuser.password);
    }
    if(newuser.image){
        const oldimg=await User.findById(req.userId);
        if(oldimg?.image){
            const dir:string =oldimg.image;
            await fs.unlink(path.resolve(dir));
        }
    }
    newuser._id=req.userId;
    console.log(newuser.image);
    console.log(newuser);
    const user=await User.findByIdAndUpdate(req.userId,newuser, {upsert: true});
    if(!user){
        res.status(404).json('invalid user')
    }
    res.json(newuser);
    } catch (e) {
        res.status(400).json(e);
    }
}

