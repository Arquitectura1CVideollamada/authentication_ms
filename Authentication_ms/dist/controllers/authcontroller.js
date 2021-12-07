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
exports.imagedownload = exports.imageload = exports.uservalidation = exports.updprofile = exports.profile = exports.signin = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const usertoken_1 = __importDefault(require("../models/usertoken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
    console.log('singup r');
    console.log(req.body);
    try {
        const user = new user_1.default({
            username: req.body.username,
            email: req.body.email,
            image: "",
            status: "Pending",
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
        const ere = saveduser.toJSON();
        delete ere['__v'];
        delete ere['_id'];
        //delete ere['createdAt'];
        //delete ere['updatedAt'];
        console.log(ere);
        res.json(ere);
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
    const ere = user.toJSON();
    console.log(ere);
    res.header('auth-token', token).json({ 'authtoken': token });
});
exports.signin = signin;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //const user=await User.findById(req.userId,{password:0});
    const user = yield user_1.default.findById(req.userId, { password: 0 });
    if (!user) {
        res.status(404).json('invalid user');
    }
    console.log(user);
    res.json(user);
});
exports.profile = profile;
const ftp = require("../libs/ftp");
const updprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('upd');
    const us = yield user_1.default.findById(req.userId);
    try {
        const newuser = new user_1.default({
            username: req.body.username,
            password: req.body.password,
            image: req.body.image
        });
        if (us) {
            newuser.email = us === null || us === void 0 ? void 0 : us.email;
            newuser.status = us === null || us === void 0 ? void 0 : us.status;
        }
        if (newuser.password) {
            newuser.password = yield newuser.encryptPassword(newuser.password);
        }
        if (newuser.image) {
            if (us) {
                const oldim = us === null || us === void 0 ? void 0 : us.image;
                yield ftp.ftpremove(oldim);
            }
            var base64Data = req.body.image;
            let base64Image = base64Data.split(';base64,').pop();
            //console.log(base64Data);
            const filename = (0, uuid_1.v4)() + '.jpg';
            fs_extra_1.default.writeFile(filename, base64Image, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });
            yield ftp.ftpupload(filename, 'images/' + filename);
            newuser.image = 'images/' + filename;
            yield fs_extra_1.default.unlink(filename);
        }
        newuser._id = req.userId;
        const user = yield user_1.default.findByIdAndUpdate(req.userId, newuser, { upsert: true });
        if (!user) {
            res.status(404).json('invalid user');
        }
        const re = yield user_1.default.findById(req.userId);
        console.log(re);
        res.json(re);
    }
    catch (e) {
        res.status(400).json(e);
    }
});
exports.updprofile = updprofile;
const uservalidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params);
    const ut = yield usertoken_1.default.findOne({ token: req.params.confirmationCode });
    console.log(ut);
    if (ut) {
        const userval = ut === null || ut === void 0 ? void 0 : ut.user;
        console.log(userval);
        const upd = yield user_1.default.findByIdAndUpdate(userval, { status: "Active" }, { upsert: true });
        res.json(upd);
    }
    else {
        res.status(404).json('invalid token');
    }
});
exports.uservalidation = uservalidation;
const uuid_1 = require("uuid");
const imageload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //const base64data=req.body.image;
    var base64Data = req.body.image;
    let base64Image = base64Data.split(';base64,').pop();
    //console.log(base64Data);
    const filename = (0, uuid_1.v4)() + '.jpg';
    fs_extra_1.default.writeFile(filename, base64Image, { encoding: 'base64' }, function (err) {
        console.log('File created');
    });
    yield ftp.ftpupload(filename, 'images/' + filename);
    yield fs_extra_1.default.unlink(filename);
    res.json('image uploaded');
});
exports.imageload = imageload;
const imagedownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const image = req.body.image;
    console.log(image);
    if (image) {
        yield ftp.ftpdownload(image, image);
        const a = yield fs_extra_1.default.readFile(image, 'base64');
        res.json({ 'image': a });
        yield fs_extra_1.default.unlink(image);
    }
    else {
        res.status(404).json('invalid image path');
    }
});
exports.imagedownload = imagedownload;
//# sourceMappingURL=authcontroller.js.map