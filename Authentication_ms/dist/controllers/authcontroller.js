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
exports.uservalidation = exports.loadimage = exports.updprofile = exports.profile = exports.signin = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const usertoken_1 = __importDefault(require("../models/usertoken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
function ValidateEmail(input) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex)) {
        return true;
    }
    else {
        return false;
    }
}
//import nodemailer  from 'libs/mailer';
const nodemailer = require("../libs/mailer");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new user_1.default({
            username: req.body.username,
            email: req.body.email,
            image: null,
            password: req.body.password
        });
        user.password = yield user.encryptPassword(user.password);
        console.log(user.password);
        if (!ValidateEmail(user.email)) {
            return res.status(400).json('invalid email');
        }
        ;
        const saveduser = yield user.save();
        try {
            const tk = jsonwebtoken_1.default.sign({ email: req.body.email }, process.env.TOKENSECRET || 'tokentest');
            const usertoken = new usertoken_1.default({
                user: saveduser,
                token: tk
            });
            const savedusertoken = yield usertoken.save();
            const mail = nodemailer.sendConfirmationEmail(saveduser.username, saveduser.email, savedusertoken.token);
            console.log(mail);
        }
        catch (e) {
            res.status(400).json(e);
        }
        res.json(saveduser);
        console.log(saveduser);
    }
    catch (e) {
        res.status(400).json(e);
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json('invalid email or password');
    }
    const correctpass = yield user.validatePassword(req.body.password);
    if (!correctpass) {
        return res.status(400).json('invalid password');
    }
    if (user.status != "Active") {
        return res.status(401).send({
            message: "Pending Account. Please Verify Your Email!",
        });
    }
    const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.TOKENSECRET || 'tokentest', {
        expiresIn: 60 * 60 * 24
    });
    res.header('auth-token', token).json(user);
});
exports.signin = signin;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.userId, { password: 0 });
    if (!user) {
        res.status(404).json('invalid user');
    }
    res.json(user);
});
exports.profile = profile;
const updprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('upd');
    try {
        const newuser = new user_1.default({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path
        });
        if (newuser.password) {
            newuser.password = yield newuser.encryptPassword(newuser.password);
        }
        if (newuser.image) {
            const oldimg = yield user_1.default.findById(req.userId);
            if (oldimg === null || oldimg === void 0 ? void 0 : oldimg.image) {
                const dir = oldimg.image;
                yield fs_extra_1.default.unlink(path_1.default.resolve(dir));
            }
        }
        newuser._id = req.userId;
        console.log(newuser.image);
        console.log(newuser);
        const user = yield user_1.default.findByIdAndUpdate(req.userId, newuser, { upsert: true });
        if (!user) {
            res.status(404).json('invalid user');
        }
        res.json(newuser);
    }
    catch (e) {
        res.status(400).json(e);
    }
});
exports.updprofile = updprofile;
const request_1 = __importDefault(require("request"));
const loadimage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const img = req.file;
    if (img) {
        const user = yield user_1.default.findById(req.userId, { password: 0 });
        //request.post('host.docker.internal:3001/',);
        request_1.default.post('localhost:3001/');
    }
});
exports.loadimage = loadimage;
const uservalidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params);
    const ut = yield usertoken_1.default.findOne({ token: req.params.confirmationCode });
    console.log(ut);
    if (ut) {
        const userval = ut === null || ut === void 0 ? void 0 : ut.user;
        console.log(userval);
        yield user_1.default.findByIdAndUpdate(userval, { status: "Active" }, { upsert: true });
    }
    res.json();
});
exports.uservalidation = uservalidation;
//# sourceMappingURL=authcontroller.js.map