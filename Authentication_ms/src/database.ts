import mongoose from 'mongoose';



//mongoose.connect('mongodb://localhost/auth_db',{
mongoose.connect('mongodb://mongo:27018/auth_db',{

}).then(db => console.log('database conected')).catch(err =>console.log(err));