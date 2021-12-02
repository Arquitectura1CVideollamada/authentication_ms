import {Request,Response} from 'express'

import User,{IUser} from '../models/user';

import Usertoken, { IUsertoken } from '../models/usertoken';

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

//import nodemailer  from 'libs/mailer';
const nodemailer = require("../libs/mailer");
export const signup= async(req:Request,res:Response)=>{
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
    try {
        const tk = jwt.sign({email: req.body.email}, process.env.TOKENSECRET||'tokentest');
        const usertoken : IUsertoken=new Usertoken({
        user:saveduser,
        token:tk});
        const savedusertoken = await usertoken.save();
        const mail=nodemailer.sendConfirmationEmail(
        saveduser.username,
        saveduser.email,
        savedusertoken.token
        );
        console.log(mail)
    }catch (e) {
        res.status(400).json(e);
    }
    res.json(saveduser);
    console.log(saveduser);
    } catch (e) {
        res.status(400).json(e);
    }
    
}
export const signin=async (req:Request,res:Response)=>{
    const user=await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).json('invalid email or password');
    }
    const correctpass:boolean=await user.validatePassword(req.body.password);
    if(!correctpass){
        return res.status(400).json('invalid password');
    }
    if(user.status != "Active") {
        return res.status(401).send({
          message: "Pending Account. Please Verify Your Email!",
        });
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
import { v4 as uuidv4 } from 'uuid';
import request from 'request';
export const loadimage=async (req:Request,res:Response)=>{
    const img=req.file;
    if(img){
        const user=await User.findById(req.userId,{password:0});
        //request.post('host.docker.internal:3001/',);
        request.post('localhost:3001/',);
    }
}

export const uservalidation=async (req:Request,res:Response)=>{
    console.log(req.params);
    const ut=await Usertoken.findOne({token:req.params.confirmationCode});
    console.log(ut);
    if(ut){
        const userval=ut?.user;
        console.log(userval);
        await User.findByIdAndUpdate(userval,{status:"Active"}, {upsert: true});
    }
    res.json()
}

