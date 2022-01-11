"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenval = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authtoken_1 = __importDefault(require("../models/authtoken"));
const tokenval = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('authtoken');
    const tokenindb = yield authtoken_1.default.findOne({ sesiontoken: token });
    if (!tokenindb) {
        return res.status(401).json('Access denied');
    }
    console.log(token);
    if (!token) {
        return res.status(401).json('Access denied');
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.TOKENSECRET || 'tokentest');
    req.userId = payload._id;
    next();
});
exports.tokenval = tokenval;
//# sourceMappingURL=validateToken.js.map