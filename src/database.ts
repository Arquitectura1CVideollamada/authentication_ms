import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config({ path:'../env' });
//require('dotenv').config({path:'../env'});

//mongoose.connect(process.env.DB_URL!,{
//mongoose.connect('mongodb+srv://user:pass@cluster0.dclce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
mongoose.connect('mongodb://localhost/auth_db',{
//mongoose.connect('mongodb://mongo:27018/auth_db',{

}).then(db => console.log('database conected')).catch(err =>console.log(err));