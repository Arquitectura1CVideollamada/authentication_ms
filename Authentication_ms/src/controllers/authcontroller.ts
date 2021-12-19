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
    console.log('singup r')
    console.log(req.body);
    try {
        const user : IUser=new User({
        username:req.body.username,
        email:req.body.email,
        image:"",
        status:"Pending",
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
    const ere=saveduser.toJSON();
    delete ere['__v'];
    delete ere['_id'];
   //delete ere['createdAt'];
    //delete ere['updatedAt'];
    console.log(ere);
    var amqp = require('amqplib/callback_api');
    amqp.connect('amqp://host.docker.internal', function(error0:any, connection:any) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1:any, channel:any) {
            if (error1) {
            throw error1;
            }
            var queue = 'usersetting';
            var msg = ere.email;
            channel.assertQueue(queue, {
            durable: false
            });
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    });
    res.json(ere);
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
    const ere=user.toJSON();
    console.log(ere);
    res.header('auth-token',token).json({'authtoken': token});
}
export const profile=async (req:Request,res:Response)=>{
    //const user=await User.findById(req.userId,{password:0});
    const user=await User.findById(req.userId,{password:0});
    if(!user){
        res.status(404).json('invalid user')
    }
    console.log(user);
    res.json(user);
}
const ftp = require("../libs/ftp");
export const updprofile=async (req:Request,res:Response)=>{
    console.log('upd');
    const us= await User.findById(req.userId);
    try {
        const newuser : IUser=new User({
        username:req.body.username,
        password:req.body.password,
        image:req.body.image,
        status:"Pending"
    });
    if(us){
        newuser.email=us?.email;
        newuser.status=us?.status;
    }
    if(newuser.password){
        newuser.password= await newuser.encryptPassword(newuser.password);
    }
    if(newuser.image){
        if(us){
            const oldim=us?.image;
            await ftp.ftpremove(oldim);
        }
        var base64Data = req.body.image;
        let base64Image = base64Data.split(';base64,').pop();
        //console.log(base64Data);
        const filename=uuidv4()+'.jpg';
        fs.writeFile(filename, base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        await ftp.ftpupload(filename,'images/'+filename);
        newuser.image='images/'+filename;
        await fs.unlink(filename);
    }
    newuser._id=req.userId;
    const user=await User.findByIdAndUpdate(req.userId,newuser, {upsert: true});
    if(!user){
        res.status(404).json('invalid user')
    }
    const re=await User.findById(req.userId);
    console.log(re);
    res.json(re);
    } catch (e) {
        res.status(400).json(e);
    }
}


export const uservalidation=async (req:Request,res:Response)=>{
    console.log(req.params);
    const ut= await Usertoken.findOne({token:req.params.confirmationCode});
    console.log(ut);
    if(ut){
        const userval=ut?.user;
        console.log(userval);
        const upd= await User.findByIdAndUpdate(userval,{status:"Active"}, {upsert: true});
        res.json(upd);
    }else{
        res.status(404).json('invalid token');
    }
}

import { v4 as uuidv4 } from 'uuid';
import fetch from "node-fetch";
export const imageload= async (req:Request,res:Response)=>{
    //const base64data=req.body.image;
    var base64Data = req.body.image;
    let base64Image = base64Data.split(';base64,').pop();
    //console.log(base64Data);
    const filename=uuidv4()+'.jpg';
    fs.writeFile(filename, base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });
    await ftp.ftpupload(filename,'images/'+filename);
    await fs.unlink(filename);
    res.json('image uploaded')
}


export const imagedownload= async (req:Request,res:Response)=>{
    const image=req.body.image;
    console.log(image)
    if(image){
        await ftp.ftpdownload(image,image);
        const a=await fs.readFile(image,'base64');
        res.json({'image':a});
        await fs.unlink(image);
    }else{
        res.status(404).json('invalid image path')
    }
}


export const mq= async (req:Request,res:Response)=>{
    console.log("mq");
    var amqp = require('amqplib/callback_api');
    amqp.connect('amqp://host.docker.internal', function(error0:any, connection:any) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1:any, channel:any) {
            if (error1) {
            throw error1;
            }
            var queue = 'hello';
            var msg = 'Hello world';

            channel.assertQueue(queue, {
            durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    });
    res.json({'val':'asdasd'});
}

