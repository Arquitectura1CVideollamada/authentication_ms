"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//mongoose.connect('mongodb://localhost/test',{
mongoose_1.default.connect('mongodb://localhost:27017/auth_db', {}).then(db => console.log('database conected')).catch(err => console.log(err));
//# sourceMappingURL=database.js.map