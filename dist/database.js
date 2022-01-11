"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../env' });
//require('dotenv').config({path:'../env'});
mongoose_1.default.connect(process.env.DB_URL, {
//mongoose.connect('mongodb+srv://user:pass@cluster0.dclce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
//mongoose.connect('mongodb://localhost/auth_db',{
//mongoose.connect('mongodb://mongo:27018/auth_db',{
}).then(db => console.log('database conected')).catch(err => console.log(err));
//# sourceMappingURL=database.js.map