import mongoose from 'mongoose';


mongoose.connect('mongodb+srv://user:pass@cluster0.dclce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
//mongoose.connect('mongodb://localhost/auth_db',{
//mongoose.connect('mongodb://mongo:27018/auth_db',{

}).then(db => console.log('database conected')).catch(err =>console.log(err));