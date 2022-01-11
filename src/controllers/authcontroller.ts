import {Request,Response} from 'express'

import User,{IUser} from '../models/user';

import Usertoken, { IUsertoken } from '../models/usertoken';

import Authtoken, { IAuthtoken } from '../models/authtoken';

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
    const ldap = require('ldapjs');
    const client = ldap.createClient({
    url: 'ldap://host.docker.internal:389'
    });
    client.bind('cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co', 'admin', function (err:any) {
        if (err) {
            console.log("Error in new connetion " + err)
        } else {
            console.log("Success");
            let entry2 = {
                uid: ere.email,
                givenName: ere.username,
                cn: ere.username,
                userPassword: req.body.password,
                objectClass: "inetOrgPerson",
                sn:' '
              };
              var userId=ere.email;
              var dir='cn=' + userId + ','  +'ou=sa,'+ 'dc=arqsoft,dc=unal,dc=edu,dc=co';
              client.add(dir, entry2, (err:any) => {
              //client.add('cn=ejem, ou=sa, dc=arqsoft,dc=unal,dc=edu,dc=co', entry2, (err) => {
                if (err) {
                    console.log("Error in creation " + err)
                }
                else{
                    console.log("Successfull"); 
                }
              });
        }
    });
    res.json(ere);
    } catch (e) {
        res.status(400).json(e);
    }
    
}
export const signin=async (req:Request,res:Response)=>{
    console.log('login');
    const user=await User.findOne({email: req.body.email});
    //const ldap = require('ldapjs');
    console.log(user);
    const ldap = require('ldapjs-promise');
    var validldap=true;
    const client = ldap.createClient({
    url: 'ldap://host.docker.internal:389'
    });
    var Promise = require('bluebird');
    Promise.promisifyAll(client);
    if(req.body.email && req.body.password){
        console.log('cn=' + req.body.email + ',' +'ou=sa,'+ 'dc=arqsoft,dc=unal,dc=edu,dc=co')
        await client.bindAsync('cn=' + req.body.email + ',' +'ou=sa,'+ 'dc=arqsoft,dc=unal,dc=edu,dc=co',
        req.body.password).then() // if it works, call doSearch
        .catch(function (err:any) { // if bind fails, handle it
          console.error('Error on bind', err)
          validldap=false;
          console.log('change');
        }
      ); 
    }
    else{
        return res.status(404).json('missing email or password');
    }
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
    console.log(validldap);
    if(!validldap){
        return res.status(400).json('invalid email or password on ldap');
    }
    try {
        const sesiontoken : IAuthtoken=new Authtoken({
        user:user,
        sesiontoken:token});
        const autoken=await Authtoken.findOne({"user.email":user.email});
        if(autoken){
            console.log(autoken);
            autoken.sesiontoken=token;
            await Authtoken.findByIdAndUpdate(autoken._id,autoken, {upsert: true});
        }else{
            const savedusertoken = await sesiontoken.save();
        }
        
    }catch (e) {
        res.status(400).json(e);
    }

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
    else{
       const usertok= await Authtoken.findOne({"user.email":user.email});
        if(usertok){
            usertok.user=newuser;
            const newusertok= await Authtoken.findOneAndUpdate({"user.email":user.email},usertok, {upsert: true});
            console.log(usertok);
        }
    }
    const re=await User.findById(req.userId);
    console.log(re); 
    if(req.body.password!=null && user!=null){
        const ldap = require('ldapjs');
        const client = ldap.createClient({
        url: 'ldap://host.docker.internal:389'
        });
        client.bind('cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co', 'admin', function (err:any) {
            if (err) {
                console.log("Error in new connetion " + err)
            } else {
                console.log("Success");
                  var dir='cn=' + user.email + ','  +'ou=sa,'+ 'dc=arqsoft,dc=unal,dc=edu,dc=co';
                  client.modify(dir, [
                    new ldap.Change({
                      operation: 'replace',
                      modification: {
                        userPassword: req.body.password
                      }
                    })
                  ], (err:any) => {
                  //client.add('cn=ejem, ou=sa, dc=arqsoft,dc=unal,dc=edu,dc=co', entry2, (err) => {
                    if (err) {
                        console.log("Error in modification " + err)
                    }
                    else{
                        console.log("Successfull"); 
                    }
                  });
            }
        });
    }
    
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
        try{
            await ftp.ftpdownload(image,image);
            const a=await fs.readFile(image,'base64');
            res.json({'image':a});
            await fs.unlink(image);
        }
        catch(err){
            res.status(404).json('invalid image path')
        }
    }else{
        res.status(404).json('invalid image path')
    }
}

export const mq= async (req:Request,res:Response)=>{
    console.log("mq");
    const ldap = require('ldapjs');

    const client = ldap.createClient({
    url: 'ldap://localhost:389'
    });

    client.bind('cn=admin,dc=arqsoft,dc=unal,dc=edu,dc=co', 'admin', function (err:any) {
    //client.bind('cn=Jeisson Andres Vergara Vargas,ou=sa,dc=arqsoft,dc=unal,dc=edu,dc=co', '123', function (err) {
        if (err) {
            console.log("Error in new connetion " + err)
        } else {
            /*if connection is success then go for any operation*/
            console.log("Success");
            let entry2 = {
                uid: 'ejemplo',
                givenName: 'ejemplo',
                cn: 'ejemp',
                userPassword: 'password',
                objectClass: "inetOrgPerson",
                sn:'ej'
              };
              var userId='ejemp';
              var dir='cn=' + userId + ',' + 'dc=arqsoft,dc=unal,dc=edu,dc=co';
              client.add(dir, entry2, (err:any) => {
              //client.add('cn=ejem, ou=sa, dc=arqsoft,dc=unal,dc=edu,dc=co', entry2, (err) => {
                if (err) {
                    console.log("Error in creation " + err)
                }
                else{
                    console.log("Successfull"); 
                }
              });
            //searchUser();
            //addUser();
            //deleteUser();
            //addUserToGroup('cn=Administrators,ou=groups,ou=system');
            //deleteUserFromGroup('cn=Administrators,ou=groups,ou=system');
            //updateUser('cn=test,ou=users,ou=system');
            //compare('cn=test,ou=users,ou=system');
             
            

        }
    });
    
    res.json({'val':'asdasd'});
    
}

