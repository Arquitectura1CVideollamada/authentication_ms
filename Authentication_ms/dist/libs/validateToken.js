"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenval = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenval = (req, res, next) => {
    const token = req.header('authtoken');
    console.log(token);
    if (!token) {
        return res.status(401).json('Access denied');
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.TOKENSECRET || 'tokentest');
    req.userId = payload._id;
    next();
};
exports.tokenval = tokenval;
//# sourceMappingURL=validateToken.js.map